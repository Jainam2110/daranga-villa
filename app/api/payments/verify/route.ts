import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyCustomerFromHeader, isBookingOwnedByCustomer } from "@/lib/auth/customer";
import {
  getRazorpayInstance,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import { triggerBookingConfirmationEmails } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. Require Authenticated Customer
    const customerAuth = await verifyCustomerFromHeader(request);
    if (!customerAuth) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to verify payment.",
        },
        { status: 401 }
      );
    }

    // 2. Parse & validate request body
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

    // 3. Connect to Database & Load Booking from MongoDB
    await connectToDatabase();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with ID '${bookingId}' was not found.` },
        { status: 404 }
      );
    }

    // 4. Validate Customer Ownership
    if (!isBookingOwnedByCustomer(booking, customerAuth.customer)) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to verify this booking." },
        { status: 403 }
      );
    }

    // 5. Reject Cancelled Bookings
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Booking is cancelled. Cannot verify payment for cancelled bookings." },
        { status: 409 }
      );
    }

    // 6. Retrieve Expected Razorpay Order ID from Database Record (Never trust client alone)
    if (!booking.razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: "Booking does not have an active Razorpay order reference." },
        { status: 400 }
      );
    }

    if (booking.razorpayOrderId.trim() !== razorpay_order_id.trim()) {
      console.warn(`[Payment Verify Mismatch] Client order ${razorpay_order_id} does not match DB order ${booking.razorpayOrderId} for booking ${booking._id}`);
      return NextResponse.json(
        { success: false, error: "Razorpay Order ID mismatch for this booking." },
        { status: 400 }
      );
    }

    // 7. Prevent Applying Same Payment to Another Booking
    const conflictingBooking = await Booking.findOne({
      razorpayPaymentId: razorpay_payment_id.trim(),
      _id: { $ne: booking._id },
    });

    if (conflictingBooking) {
      console.warn(`[Payment Collision] Payment ID ${razorpay_payment_id} was already used on booking ${conflictingBooking._id}`);
      return NextResponse.json(
        {
          success: false,
          error: "This payment reference has already been applied to another booking.",
        },
        { status: 409 }
      );
    }

    // 8. Idempotency Check: Safely handle repeated verification requests for current booking
    if (booking.paymentStatus === "PAID" && booking.status === "CONFIRMED") {
      if (
        booking.razorpayPaymentId === razorpay_payment_id.trim() ||
        booking.razorpayOrderId === razorpay_order_id.trim()
      ) {
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

    // 9. Server-Side HMAC SHA256 Cryptographic Signature Verification
    // Uses trusted DB order ID and API secret with constant-time comparison
    const isSignatureValid = verifyRazorpayPaymentSignature({
      orderId: booking.razorpayOrderId,
      paymentId: razorpay_payment_id.trim(),
      signature: razorpay_signature.trim(),
    });

    if (!isSignatureValid) {
      console.warn(`[Payment Signature Failed] Invalid signature for Booking '${bookingId}'.`);
      return NextResponse.json(
        { success: false, error: "Invalid payment signature. Payment verification failed." },
        { status: 400 }
      );
    }

    // 10. Verify Payment Details with Razorpay Gateway SDK
    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch {
      return NextResponse.json(
        { success: false, error: "Payment service is currently unconfigured on the server." },
        { status: 500 }
      );
    }

    let fetchedPayment;
    try {
      fetchedPayment = await razorpay.payments.fetch(razorpay_payment_id.trim());
    } catch (fetchErr: unknown) {
      const errMsg = fetchErr instanceof Error ? fetchErr.message : "Razorpay payment fetch failed";
      console.error(`[Razorpay Payment Fetch Error] Payment ${razorpay_payment_id}:`, errMsg);
      return NextResponse.json(
        { success: false, error: "Payment reference not found on Razorpay gateway." },
        { status: 400 }
      );
    }

    if (!fetchedPayment) {
      return NextResponse.json(
        { success: false, error: "Payment reference not found on Razorpay gateway." },
        { status: 400 }
      );
    }

    // Validate gateway order ID match, currency, amount, and payment capture state
    const expectedAmountPaise = Math.round(booking.totalAmount * 100);

    if (
      String(fetchedPayment.order_id) !== String(booking.razorpayOrderId) ||
      fetchedPayment.currency !== "INR" ||
      Number(fetchedPayment.amount) !== expectedAmountPaise ||
      (fetchedPayment.status !== "captured" && fetchedPayment.status !== "authorized")
    ) {
      console.error(`[Payment Gateway Verification Mismatch] Booking ${bookingId}:`, {
        fetchedOrder: fetchedPayment.order_id,
        expectedOrder: booking.razorpayOrderId,
        fetchedAmount: fetchedPayment.amount,
        expectedAmount: expectedAmountPaise,
        currency: fetchedPayment.currency,
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

    // 11. Atomic MongoDB Update (Race condition safety)
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

    console.log("[Payment Verified & Booking Confirmed]", {
      bookingId: updatedBooking._id.toString(),
      orderId: updatedBooking.razorpayOrderId,
      paymentId: updatedBooking.razorpayPaymentId,
      status: updatedBooking.status,
      paymentStatus: updatedBooking.paymentStatus,
    });

    // 12. Idempotently Dispatch Booking Confirmation Emails
    try {
      const emailResult = await triggerBookingConfirmationEmails(updatedBooking._id.toString());
      console.log(`[Payment Verify] Email dispatch for booking ${updatedBooking._id}:`, emailResult);
    } catch (emailErr) {
      console.error(`[Payment Verify] Email dispatch error for booking ${updatedBooking._id}:`, emailErr);
    }

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
