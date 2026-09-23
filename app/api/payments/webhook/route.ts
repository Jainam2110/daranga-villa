import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import PaymentWebhookEvent from "@/models/PaymentWebhookEvent";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { triggerBookingConfirmationEmails } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. Read raw string body for cryptographic HMAC verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // 2. Verify HMAC SHA256 Webhook Signature
    let isSignatureValid = false;
    try {
      isSignatureValid = verifyRazorpayWebhookSignature({
        rawBody,
        signature: signature.trim(),
      });
    } catch (configErr: unknown) {
      const msg = configErr instanceof Error ? configErr.message : "Webhook config error";
      console.warn("Razorpay Webhook Unconfigured:", msg);
      return NextResponse.json(
        { success: false, error: "Webhook service is unconfigured on the server." },
        { status: 500 }
      );
    }

    if (!isSignatureValid) {
      console.warn("Razorpay Webhook: Invalid signature received.");
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
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const eventId = event?.event_id || event?.id || `${event?.event}_${Date.now()}`;
    const eventType = event?.event || "unknown";

    // 4. Webhook Idempotency: Prevent processing duplicate event deliveries
    await connectToDatabase();

    try {
      await PaymentWebhookEvent.create({
        eventId,
        eventType,
      });
    } catch (dbErr: unknown) {
      // E11000 Duplicate Key Error -> Event already processed
      const code = (dbErr as { code?: number })?.code;
      if (code === 11000) {
        return NextResponse.json(
          { status: "ok", message: "Event already processed." },
          { status: 200 }
        );
      }
    }

    // 5. Handle Payment Events
    if (
      eventType === "payment.captured" ||
      eventType === "order.paid" ||
      eventType === "payment.authorized"
    ) {
      const paymentEntity = event?.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const amountInPaise = paymentEntity?.amount;
      const currency = paymentEntity?.currency;

      if (orderId && paymentId) {
        const booking = await Booking.findOne({ razorpayOrderId: orderId });

        if (booking && booking.status !== "CANCELLED") {
          const expectedPaise = Math.round(booking.totalAmount * 100);

          // Verify currency and amount match before confirming
          if (currency === "INR" && Number(amountInPaise) === expectedPaise) {
            await Booking.updateOne(
              {
                _id: booking._id,
                status: { $ne: "CANCELLED" },
              },
              {
                $set: {
                  paymentStatus: "PAID",
                  status: "CONFIRMED",
                  razorpayPaymentId: paymentId,
                },
              }
            );

            // Idempotently Dispatch Booking Confirmation Emails
            await triggerBookingConfirmationEmails(booking._id.toString());
          } else {
            console.error(`Webhook amount mismatch for Booking ${booking._id}:`, {
              webhookAmount: amountInPaise,
              expectedAmount: expectedPaise,
            });
          }
        }
      }
    }

    // Return HTTP 200 OK to Razorpay
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
