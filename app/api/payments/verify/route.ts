import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User, { IUser } from "@/models/User";
import {
  getRazorpayInstance,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import { getAdminAuth } from "@/lib/firebase/admin";
import { triggerBookingConfirmationEmails } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. Parse & validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body || {};

    if (!bookingId || typeof bookingId !== "string" || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing Booking ID." },
        { status: 400 }
      );
    }

    if (
      !razorpay_order_id ||
      typeof razorpay_order_id !== "string" ||
      !razorpay_payment_id ||
      typeof razorpay_payment_id !== "string" ||
      !razorpay_signature ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Required Razorpay response fields missing (order_id, payment_id, signature).",
        },
        { status: 400 }
      );
    }

    // 2. Connect to Database & Load Booking
    await connectToDatabase();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with ID '${bookingId}' was not found.` },
        { status: 404 }
      );
    }

    // Reject Cancelled Bookings
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Booking is cancelled. Cannot verify payment for cancelled bookings." },
        { status: 409 }
      );
    }

    // Verify order ID match against booking's saved razorpayOrderId
    if (!booking.razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: "Booking does not have an active Razorpay order reference." },
        { status: 400 }
      );
    }

    if (booking.razorpayOrderId.trim() !== razorpay_order_id.trim()) {
      return NextResponse.json(
        { success: false, error: "Razorpay Order ID mismatch for this booking." },
        { status: 400 }
      );
    }

    // 3. Customer Authorization Verification (if Auth token header provided)
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const idToken = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
      if (idToken) {
        let decodedToken;
        try {
          decodedToken = await getAdminAuth().verifyIdToken(idToken);
        } catch {
          if (process.env.NODE_ENV !== "production") {
            try {
              const parts = idToken.split(".");
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
                if (payload && payload.sub) {
                  decodedToken = { uid: payload.sub, email: payload.email };
                }
              }
            } catch {
              // Ignore dev fallback error
            }
          }
        }

        if (!decodedToken || !decodedToken.uid) {
          return NextResponse.json(
            { success: false, error: "Invalid authentication token provided." },
            { status: 401 }
          );
        }

        let customer = (await User.findOne({ firebaseUid: decodedToken.uid })) as IUser | null;
        if (!customer && decodedToken.email) {
          customer = (await User.findOne({ email: decodedToken.email.toLowerCase() })) as IUser | null;
        }

        if (booking.customerId) {
          if (!customer || booking.customerId.toString() !== customer._id.toString()) {
            return NextResponse.json(
              { success: false, error: "You are not authorized to verify this booking." },
              { status: 403 }
            );
          }
        } else if (customer && customer.email && booking.guestEmail.toLowerCase() !== customer.email.toLowerCase()) {
          return NextResponse.json(
            { success: false, error: "You are not authorized to verify this booking." },
            { status: 403 }
          );
        }
      }
    }

    // 4. Idempotency Check: Safely handle repeated verification requests
    if (booking.paymentStatus === "PAID" && booking.status === "CONFIRMED") {
      if (booking.razorpayPaymentId === razorpay_payment_id || booking.razorpayOrderId === razorpay_order_id) {
        return NextResponse.json(
          {
            success: true,
            message: "Booking is already paid and confirmed.",
            booking,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Booking has already been paid for with a different payment reference.",
          },
          { status: 409 }
        );
      }
    }

    // 5. Server-Side HMAC SHA256 Cryptographic Signature Verification
    const isSignatureValid = verifyRazorpayPaymentSignature({
      orderId: razorpay_order_id.trim(),
      paymentId: razorpay_payment_id.trim(),
      signature: razorpay_signature.trim(),
    });

    if (!isSignatureValid) {
      console.warn(`Payment signature verification failed for Booking '${bookingId}'.`);
      return NextResponse.json(
        { success: false, error: "Invalid payment signature. Payment verification failed." },
        { status: 400 }
      );
    }

    // 6. Verify Payment / Order Details with Razorpay Gateway SDK
    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch {
      return NextResponse.json(
        { success: false, error: "Razorpay service unconfigured on server." },
        { status: 500 }
      );
    }

    const fetchedPayment = await razorpay.payments.fetch(razorpay_payment_id.trim());

    if (!fetchedPayment) {
      return NextResponse.json(
        { success: false, error: "Payment reference not found on Razorpay gateway." },
        { status: 400 }
      );
    }

    // Validate gateway order ID match, currency, amount, and status
    const expectedAmountPaise = Math.round(booking.totalAmount * 100);

    if (
      String(fetchedPayment.order_id) !== String(booking.razorpayOrderId) ||
      fetchedPayment.currency !== "INR" ||
      Number(fetchedPayment.amount) !== expectedAmountPaise ||
      (fetchedPayment.status !== "captured" && fetchedPayment.status !== "authorized")
    ) {
      console.error(`Payment gateway mismatch for Booking ${bookingId}:`, {
        fetchedOrder: fetchedPayment.order_id,
        expectedOrder: booking.razorpayOrderId,
        fetchedAmount: fetchedPayment.amount,
        expectedAmount: expectedAmountPaise,
        fetchedStatus: fetchedPayment.status,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed: Gateway details do not match booking requirements.",
        },
        { status: 400 }
      );
    }

    // 7. Atomic MongoDB Update (Race condition safety)
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: { $ne: "CANCELLED" },
      },
      {
        $set: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          razorpayPaymentId: razorpay_payment_id.trim(),
        },
      },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: "Failed to update booking status." },
        { status: 500 }
      );
    }

    // 8. Idempotently Dispatch Booking Confirmation Emails
    void triggerBookingConfirmationEmails(updatedBooking._id.toString());

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully. Booking is now confirmed.",
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
    console.error("Razorpay Payment Verification API Error:", errMessage);

    return NextResponse.json(
      { success: false, error: "Failed to verify payment." },
      { status: 500 }
    );
  }
}
