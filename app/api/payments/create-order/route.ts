import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User, { IUser } from "@/models/User";
import { getRazorpayInstance, getRazorpayKeyId } from "@/lib/razorpay";
import { getAdminAuth } from "@/lib/firebase/admin";

/**
 * Diagnostic & Health Check Endpoint
 * Reports presence of critical environment variables without exposing sensitive values.
 */
export async function GET() {
  const hasKeyId = Boolean(process.env.RAZORPAY_KEY_ID?.trim());
  const hasKeySecret = Boolean(process.env.RAZORPAY_KEY_SECRET?.trim());
  const hasMongoUri = Boolean(process.env.MONGODB_URI?.trim());

  return NextResponse.json({
    status: "ok",
    endpoint: "/api/payments/create-order",
    environment: {
      RAZORPAY_KEY_ID: hasKeyId ? "PRESENT" : "MISSING",
      RAZORPAY_KEY_SECRET: hasKeySecret ? "PRESENT" : "MISSING",
      MONGODB_URI: hasMongoUri ? "PRESENT" : "MISSING",
    },
  });
}

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

    const { bookingId } = body || {};

    if (!bookingId || typeof bookingId !== "string" || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing Booking ID." },
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

    // 3. Validate Booking State
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Booking is cancelled. Orders cannot be created for cancelled bookings." },
        { status: 409 }
      );
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Booking is already completed." },
        { status: 409 }
      );
    }

    if (booking.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Booking has already been paid for." },
        { status: 409 }
      );
    }

    // Check if Payment Hold Expiry Window has elapsed for PENDING unpaid booking
    if (
      booking.status === "PENDING" &&
      booking.paymentHoldExpiresAt &&
      new Date(booking.paymentHoldExpiresAt).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Your payment hold window has expired. Please select your stay dates and start a new booking.",
        },
        { status: 409 }
      );
    }

    // 4. Customer Ownership Verification (if Auth header is provided)
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const idToken = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
      if (idToken) {
        let decodedToken;
        try {
          decodedToken = await getAdminAuth().verifyIdToken(idToken);
        } catch {
          // Dev fallback decoding
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

        // Fetch customer profile
        let customer = (await User.findOne({ firebaseUid: decodedToken.uid })) as IUser | null;
        if (!customer && decodedToken.email) {
          customer = (await User.findOne({ email: decodedToken.email.toLowerCase() })) as IUser | null;
        }

        // Verify booking belongs to customer
        if (booking.customerId) {
          if (!customer || booking.customerId.toString() !== customer._id.toString()) {
            return NextResponse.json(
              { success: false, error: "You are not authorized to access this booking." },
              { status: 403 }
            );
          }
        } else if (customer && customer.email && booking.guestEmail.toLowerCase() !== customer.email.toLowerCase()) {
          return NextResponse.json(
            { success: false, error: "You are not authorized to access this booking." },
            { status: 403 }
          );
        }
      }
    }

    // 5. Server-side Amount Validation & Conversion
    // booking.totalAmount is in INR. Convert to paise using integer arithmetic.
    const totalAmountInInr = booking.totalAmount;
    if (typeof totalAmountInInr !== "number" || isNaN(totalAmountInInr) || totalAmountInInr <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid booking total amount." },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(totalAmountInInr * 100);
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, error: "Calculated payment amount is invalid." },
        { status: 400 }
      );
    }

    // 6. Validate Razorpay Server Setup & Credentials
    let razorpay;
    let keyId;
    try {
      razorpay = getRazorpayInstance();
      keyId = getRazorpayKeyId();
    } catch (configErr: unknown) {
      const msg = configErr instanceof Error ? configErr.message : "Razorpay config error";
      console.error("Razorpay Configuration Failure:", msg);
      return NextResponse.json(
        {
          success: false,
          error: "Payment service is currently unconfigured or unavailable on the server.",
          details: process.env.NODE_ENV !== "production" ? msg : undefined,
        },
        { status: 500 }
      );
    }

    // 7. Idempotency Check: Reuse existing active Razorpay order if present
    if (booking.razorpayOrderId) {
      try {
        const existingOrder = await razorpay.orders.fetch(booking.razorpayOrderId);
        if (existingOrder) {
          if (existingOrder.status === "paid") {
            booking.paymentStatus = "PAID";
            await booking.save();
            return NextResponse.json(
              { success: false, error: "Booking has already been paid for." },
              { status: 409 }
            );
          }

          if (existingOrder.status === "created" || existingOrder.status === "attempted") {
            return NextResponse.json(
              {
                success: true,
                order: {
                  id: existingOrder.id,
                  amount: Number(existingOrder.amount),
                  currency: existingOrder.currency,
                },
                keyId,
              },
              { status: 200 }
            );
          }
        }
      } catch (orderFetchErr: unknown) {
        const fetchMsg = orderFetchErr instanceof Error ? orderFetchErr.message : "Fetch order error";
        console.warn(`Existing Razorpay order '${booking.razorpayOrderId}' could not be reused:`, fetchMsg);
      }
    }

    // 8. Create Razorpay Order
    // Format receipt safely: daranga_<bookingId> (max 40 chars)
    const receipt = `daranga_${booking._id.toString()}`.slice(0, 40);
    const notes = {
      bookingId: booking._id.toString(),
      villaId: booking.villaId ? booking.villaId.toString() : "",
    };

    console.log("[Razorpay Order Create Attempt]", {
      bookingId: booking._id.toString(),
      amount: amountInPaise,
      currency: "INR",
      hasKeyId: Boolean(process.env.RAZORPAY_KEY_ID?.trim()),
      hasKeySecret: Boolean(process.env.RAZORPAY_KEY_SECRET?.trim()),
    });

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes,
      });
    } catch (orderCreateErr: unknown) {
      // Extract safe diagnostic details without exposing secrets
      const errObj = orderCreateErr as {
        statusCode?: number;
        error?: {
          code?: string;
          description?: string;
        };
        message?: string;
      };

      const statusCode = errObj?.statusCode || 500;
      const errorCode = errObj?.error?.code || "ORDER_CREATION_FAILED";
      const errorDescription =
        errObj?.error?.description || errObj?.message || "Razorpay API order creation failed";

      console.error("[Razorpay Order Create Error]", {
        bookingId: booking._id.toString(),
        statusCode,
        errorCode,
        errorDescription,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Failed to initiate payment gateway order.",
          code: errorCode,
          details: process.env.NODE_ENV !== "production" ? errorDescription : undefined,
        },
        { status: statusCode >= 400 && statusCode < 600 ? statusCode : 500 }
      );
    }

    if (!razorpayOrder || !razorpayOrder.id) {
      return NextResponse.json(
        { success: false, error: "Failed to create order with Razorpay." },
        { status: 500 }
      );
    }

    // 9. Save Razorpay Order ID on Booking (Keep booking status PENDING, paymentStatus UNPAID)
    booking.razorpayOrderId = razorpayOrder.id;
    if (booking.paymentStatus !== "PAID") {
      booking.paymentStatus = "UNPAID";
    }
    if (booking.status !== "CONFIRMED") {
      booking.status = "PENDING";
    }
    await booking.save();

    // 10. Return public payload for client
    return NextResponse.json(
      {
        success: true,
        order: {
          id: razorpayOrder.id,
          amount: Number(razorpayOrder.amount),
          currency: razorpayOrder.currency,
        },
        keyId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
    console.error("Razorpay Create Order API Error:", errMessage);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process payment order creation.",
        details: process.env.NODE_ENV !== "production" ? errMessage : undefined,
      },
      { status: 500 }
    );
  }
}
