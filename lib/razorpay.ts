import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Server-side helper to instantiate Razorpay SDK.
 * NEVER import this file in client components.
 */
export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variable is not defined."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Safely retrieve the public Razorpay Key ID for client initialization.
 */
export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  if (!keyId) {
    throw new Error("Razorpay configuration error: RAZORPAY_KEY_ID is missing.");
  }
  return keyId;
}

/**
 * Server-side HMAC SHA256 Signature Verification for Razorpay Payment Callbacks.
 * Calculates expected signature for `orderId|paymentId` using RAZORPAY_KEY_SECRET
 * and compares using timing-safe buffer comparison.
 */
export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) {
    throw new Error("Razorpay configuration error: RAZORPAY_KEY_SECRET is missing.");
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
  } catch {
    return false;
  }
}

/**
 * Server-side HMAC SHA256 Signature Verification for Razorpay Webhooks.
 * Calculates expected signature for raw request text body using RAZORPAY_WEBHOOK_SECRET
 * and compares using timing-safe buffer comparison.
 */
export function verifyRazorpayWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    throw new Error("Razorpay webhook configuration error: RAZORPAY_WEBHOOK_SECRET is missing.");
  }

  if (!rawBody || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
  } catch {
    return false;
  }
}
