import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyCustomerFromHeader, isBookingOwnedByCustomer } from "@/lib/auth/customer";
import { checkVillaAvailability } from "@/lib/booking/availability";
import { getRazorpayInstance, getRazorpayKeyId } from "@/lib/razorpay";

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
    // 1. Require Authenticated Customer
    const customerAuth = await verifyCustomerFromHeader(request);
    if (!customerAuth) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in to initiate payment.",
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

    const { bookingId } = body || {};

    if (!bookingId || typeof bookingId !== "string" || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing Booking ID." },
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

    // 4. Validate Customer Ownership of Booking
    if (!isBookingOwnedByCustomer(booking, customerAuth.customer)) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to access this booking." },
        { status: 403 }
      );
    }

    // Bind customer ID if not already bound
    if (!booking.customerId && customerAuth.customer._id) {
      booking.customerId = customerAuth.customer._id as mongoose.Types.ObjectId;
      await booking.save();
    }

    // 5. Validate Booking Lifecycle State
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

    // 6. Validate Temporary Hold Expiry
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

    // 7. Validate Booking Dates, Villa Active Status, and Availability
    const availability = await checkVillaAvailability({
      villaId: booking.villaId.toString(),
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      excludeBookingId: booking._id.toString(),
    });

    if (!availability.available) {
      return NextResponse.json(
        {
          success: false,
          error: availability.error || "The selected dates are no longer available.",
          code: availability.errorCode,
        },
        { status: 409 }
      );
    }

    // 8. Calculate Payable Amount Using Trusted Server-Side Pricing
    const trustedTotalAmount = availability.totalAmount;
    if (booking.totalAmount !== trustedTotalAmount) {
      console.log(
        `[Pricing Authority] Updating booking ${booking._id} totalAmount from ${booking.totalAmount} to trusted server price ${trustedTotalAmount}`
      );
      booking.totalAmount = trustedTotalAmount;
      await booking.save();
    }

    const amountInPaise = Math.round(trustedTotalAmount * 100);
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, error: "Calculated payment amount is invalid." },
        { status: 400 }
      );
    }

    // 9. Load Razorpay SDK and Public Key
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
          error: "Payment service is currently unavailable on the server.",
        },
        { status: 500 }
      );
    }

    // 10. Idempotency Check: Reuse existing active Razorpay order if present and valid
    if (booking.razorpayOrderId) {
      try {
        const existingOrder = await razorpay.orders.fetch(booking.razorpayOrderId);
        if (existingOrder) {
          if (existingOrder.status === "paid") {
            booking.paymentStatus = "PAID";
            booking.status = "CONFIRMED";
            await booking.save();
            return NextResponse.json(
              { success: false, error: "Booking has already been paid for." },
              { status: 409 }
            );
          }

          if (
            (existingOrder.status === "created" || existingOrder.status === "attempted") &&
            Number(existingOrder.amount) === amountInPaise &&
            existingOrder.currency === "INR"
          ) {
            console.log(`[Razorpay Order Reused] Order ${existingOrder.id} reused for booking ${booking._id}`);
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

    // 11. Create Razorpay Order in INR
    const receipt = `daranga_${booking._id.toString()}`.slice(0, 40);
    const notes = {
      bookingId: booking._id.toString(),
      villaId: booking.villaId ? booking.villaId.toString() : "",
      customerId: customerAuth.customer._id ? customerAuth.customer._id.toString() : "",
    };

    console.log("[Razorpay Order Create Attempt]", {
      bookingId: booking._id.toString(),
      amountInPaise,
      currency: "INR",
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

    // 12. Store Razorpay Order ID and state on Booking
    booking.razorpayOrderId = razorpayOrder.id;
    if (booking.paymentStatus !== "PAID") {
      booking.paymentStatus = "UNPAID";
    }
    if (booking.status !== "CONFIRMED") {
      booking.status = "PENDING";
    }
    await booking.save();

    console.log("[Razorpay Order Created]", {
      orderId: razorpayOrder.id,
      bookingId: booking._id.toString(),
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

    // 13. Return only public Key ID, order ID, amount, and currency
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
      },
      { status: 500 }
    );
  }
}
