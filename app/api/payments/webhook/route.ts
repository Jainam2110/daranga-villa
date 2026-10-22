import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import PaymentWebhookEvent from "@/models/PaymentWebhookEvent";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { triggerBookingConfirmationEmails } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. Read Raw String Body for Cryptographic HMAC SHA256 Verification
    // Next.js App Router request.text() receives the untouched raw body stream
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.warn("[Razorpay Webhook] Missing x-razorpay-signature header.");
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // 2. Verify HMAC SHA256 Webhook Signature with RAZORPAY_WEBHOOK_SECRET
    // Never uses RAZORPAY_KEY_SECRET for webhook verification
    let isSignatureValid = false;
    try {
      isSignatureValid = verifyRazorpayWebhookSignature({
        rawBody,
        signature: signature.trim(),
      });
    } catch (configErr: unknown) {
      const msg = configErr instanceof Error ? configErr.message : "Webhook config error";
      console.error("[Razorpay Webhook Configuration Error]", msg);
      return NextResponse.json(
        { success: false, error: "Webhook service is unconfigured on the server." },
        { status: 500 }
      );
    }

    if (!isSignatureValid) {
      console.warn("[Razorpay Webhook] Invalid signature received.");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    // 3. Parse Event Payload
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      console.warn("[Razorpay Webhook] Invalid JSON payload received.");
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const eventType = event?.event || "unknown";
    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;

    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;
    const amountInPaise = paymentEntity?.amount ?? orderEntity?.amount_paid ?? orderEntity?.amount;
    const currency = paymentEntity?.currency || orderEntity?.currency;

    // Deterministic Event ID: Use header/payload ID, or fallback to deterministic order/payment tuple
    const eventId =
      request.headers.get("x-razorpay-event-id") ||
      event?.event_id ||
      event?.id ||
      (orderId && eventType ? `${eventType}_${orderId}_${paymentId || ""}` : null);

    if (!eventId) {
      console.warn("[Razorpay Webhook] Could not determine event ID from webhook payload.");
      return NextResponse.json(
        { success: false, error: "Unable to identify event." },
        { status: 400 }
      );
    }

    // 4. Webhook Idempotency: Prevent processing duplicate event deliveries using PaymentWebhookEvent
    await connectToDatabase();

    try {
      await PaymentWebhookEvent.create({
        eventId,
        eventType,
      });
    } catch (dbErr: unknown) {
      const code = (dbErr as { code?: number })?.code;
      if (code === 11000) {
        console.log(`[Razorpay Webhook] Duplicate event already processed: ${eventId}`);
        return NextResponse.json(
          { status: "ok", message: "Event already processed." },
          { status: 200 }
        );
      }
      console.error("[Razorpay Webhook Event DB Error]:", dbErr);
    }

    console.log("[Razorpay Webhook Event Received]", {
      eventId,
      eventType,
      orderId,
      paymentId,
      amountInPaise,
      currency,
    });

    // 5. Handle Successful Payment Events (payment.captured, order.paid, payment.authorized)
    if (
      eventType === "payment.captured" ||
      eventType === "order.paid" ||
      eventType === "payment.authorized"
    ) {
      if (orderId) {
        const booking = await Booking.findOne({ razorpayOrderId: orderId });

        if (!booking) {
          console.warn(`[Razorpay Webhook] No booking found with razorpayOrderId '${orderId}'.`);
          return NextResponse.json(
            { status: "ok", message: "No matching booking found for order ID." },
            { status: 200 }
          );
        }

        if (booking.status === "CANCELLED") {
          console.warn(`[Razorpay Webhook] Booking ${booking._id} is CANCELLED. Payment not applied.`);
          return NextResponse.json(
            { status: "ok", message: "Booking is cancelled. Event ignored." },
            { status: 200 }
          );
        }

        // Validate currency and amount match before confirming
        const expectedPaise = Math.round(booking.totalAmount * 100);
        if (currency !== "INR" || Number(amountInPaise) !== expectedPaise) {
          console.error(`[Razorpay Webhook Amount/Currency Mismatch] Booking ${booking._id}:`, {
            webhookAmount: amountInPaise,
            expectedAmount: expectedPaise,
            webhookCurrency: currency,
            expectedCurrency: "INR",
          });
          return NextResponse.json(
            { status: "ok", message: "Payment amount or currency mismatch." },
            { status: 200 }
          );
        }

        // Prevent payment ID collision across bookings
        if (paymentId) {
          const conflictingBooking = await Booking.findOne({
            razorpayPaymentId: paymentId,
            _id: { $ne: booking._id },
          });

          if (conflictingBooking) {
            console.error(`[Razorpay Webhook Collision] Payment ${paymentId} already applied to booking ${conflictingBooking._id}`);
            return NextResponse.json(
              { status: "ok", message: "Payment ID already applied to another booking." },
              { status: 200 }
            );
          }
        }

        // Atomic update to PAID and CONFIRMED
        await Booking.updateOne(
          {
            _id: booking._id,
            status: { $ne: "CANCELLED" },
          },
          {
            $set: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
              ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
            },
          }
        );

        console.log(`[Razorpay Webhook] Successfully confirmed booking ${booking._id} via ${eventType}`);

        // Idempotently dispatch booking confirmation emails
        await triggerBookingConfirmationEmails(booking._id.toString());
      }
    }

    // 6. Handle Payment Failure Events (payment.failed)
    if (eventType === "payment.failed") {
      if (orderId) {
        const booking = await Booking.findOne({ razorpayOrderId: orderId });

        if (booking) {
          // Never downgrade an already PAID or CONFIRMED booking due to a delayed failure event
          if (booking.paymentStatus === "PAID" || booking.status === "CONFIRMED") {
            console.log(
              `[Razorpay Webhook] Ignored delayed payment.failed event for already PAID/CONFIRMED booking ${booking._id}.`
            );
          } else if (booking.status === "PENDING") {
            await Booking.updateOne(
              {
                _id: booking._id,
                paymentStatus: { $ne: "PAID" },
                status: "PENDING",
              },
              {
                $set: {
                  paymentStatus: "FAILED",
                },
              }
            );
            console.log(`[Razorpay Webhook] Updated booking ${booking._id} paymentStatus to FAILED.`);
          }
        }
      }
    }

    // Return HTTP 200 OK to acknowledge webhook receipt
    return NextResponse.json(
      { status: "ok", message: "Webhook event processed." },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Webhook processing error";
    console.error("Razorpay Webhook Error:", errMessage);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
