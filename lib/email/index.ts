import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import "@/models/Villa";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  mocked?: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get configured public site URL for customer email CTA buttons.
 */
export function getSiteBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

/**
 * Core transactional email sender using HTTP API (Resend / SendGrid compatible).
 * In test mode or when EMAIL_API_KEY is unset, logs dispatch safely without failing.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const { to, subject, html } = options;

  if (!to || !to.includes("@")) {
    return { success: false, error: "Invalid recipient email address." };
  }

  const apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;
  const fromAddress =
    process.env.EMAIL_FROM || "Daranga Villa <reservations@darangavilla.com>";

  // Stub/Mock mode for automated test suites or missing server API keys
  if (!apiKey || process.env.NODE_ENV === "test" || process.env.MOCK_EMAIL === "true") {
    console.log(`[EMAIL STUB] Sent "${subject}" to <${to}> from <${fromAddress}>`);
    return { success: true, mocked: true, messageId: `stub_${Date.now()}` };
  }

  try {
    // Resend HTTP API endpoint
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to.trim()],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${response.status}`;
      console.error(`Email API error for <${to}>:`, errorMsg);
      return { success: false, error: errorMsg };
    }

    return {
      success: true,
      messageId: data?.id || `resend_${Date.now()}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error sending email";
    console.error(`Email dispatch network error for <${to}>:`, msg);
    return { success: false, error: msg };
  }
}

export interface BookingEmailData {
  _id?: unknown;
  id?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guests: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  villaId?: {
    name?: string;
    title?: string;
    location?: string;
    city?: string;
    pricePerNight?: number;
  } | unknown;
  villa?: {
    name?: string;
    title?: string;
    location?: string;
    city?: string;
    pricePerNight?: number;
  } | null;
}

/**
 * Generate Customer Booking Confirmation HTML Email
 */
export function generateCustomerConfirmationEmailHtml(
  booking: BookingEmailData,
  baseUrl: string
): string {
  const villaObj =
    booking.villaId && typeof booking.villaId === "object"
      ? (booking.villaId as { name?: string; title?: string; location?: string; city?: string; pricePerNight?: number })
      : booking.villa || undefined;
  const bookingRef = `#${(booking._id || booking.id || "").toString().slice(-8).toUpperCase()}`;
  const villaName =
    villaObj?.title || villaObj?.name || "Daranga Villa Sanctuary";
  const villaLocation =
    villaObj?.location || villaObj?.city || "Kutch, Gujarat";

  const checkInStr = new Date(booking.checkIn).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const checkOutStr = new Date(booking.checkOut).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const diffTime = Math.max(0, new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime());
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const pricePerNight = villaObj?.pricePerNight || Math.round(booking.totalAmount / nights);

  const customerBookingUrl = `${baseUrl}/account/bookings/${booking._id || booking.id}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmed — Daranga Villa</title>
</head>
<body style="margin:0; padding:0; background-color:#F5F2EC; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#171513;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F5F2EC; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#151412; border-radius:16px; overflow:hidden; border:1px solid #302D28; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 36px 40px; text-align:center; border-bottom:1px solid #302D28;">
              <span style="font-size:10px; font-weight:700; letter-spacing:0.25em; color:#C89B4A; text-transform:uppercase; display:block; margin-bottom:6px;">
                DARANGA VILLA • PRIVATE SANCTUARY
              </span>
              <h1 style="font-family:Georgia, serif; font-size:28px; font-weight:300; color:#F4EFE5; margin:0; letter-spacing:0.02em;">
                Your Stay Reservation is Confirmed
              </h1>
            </td>
          </tr>

          <!-- Status & Reference -->
          <tr>
            <td style="padding: 30px 40px 10px 40px; text-align:center;">
              <span style="display:inline-block; padding: 6px 16px; background-color: rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); border-radius:20px; font-size:11px; font-weight:700; letter-spacing:0.2em; color:#34D399; text-transform:uppercase;">
                ✓ BOOKING CONFIRMED & PAID
              </span>
              <p style="font-size:13px; color:#A9A39A; margin-top:16px; margin-bottom:0; font-weight:300;">
                Booking Reference: <strong style="font-family:monospace; color:#C89B4A; font-size:15px;">${bookingRef}</strong>
              </p>
            </td>
          </tr>

          <!-- Main Details Box -->
          <tr>
            <td style="padding: 20px 40px 30px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#1C1A17; border-radius:12px; border:1px solid #302D28; padding: 24px;">
                
                <!-- Villa Title -->
                <tr>
                  <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid #302D28;">
                    <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.18em; color:#C89B4A; display:block; margin-bottom:4px;">
                      Villa Residence
                    </span>
                    <h2 style="font-family:Georgia, serif; font-size:20px; font-weight:400; color:#F4EFE5; margin:0;">
                      ${villaName}
                    </h2>
                    <span style="font-size:12px; color:#A9A39A; display:block; margin-top:2px;">
                      ${villaLocation}
                    </span>
                  </td>
                </tr>

                <!-- Schedule -->
                <tr>
                  <td style="padding: 16px 0; border-bottom:1px solid #302D28; width:50%;">
                    <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.18em; color:#A9A39A; display:block; margin-bottom:4px;">Check-In</span>
                    <span style="font-size:14px; font-weight:500; color:#F4EFE5;">${checkInStr}</span>
                    <span style="font-size:11px; color:#A9A39A; display:block; margin-top:2px;">From 2:00 PM</span>
                  </td>
                  <td style="padding: 16px 0; border-bottom:1px solid #302D28; width:50%;">
                    <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.18em; color:#A9A39A; display:block; margin-bottom:4px;">Check-Out</span>
                    <span style="font-size:14px; font-weight:500; color:#F4EFE5;">${checkOutStr}</span>
                    <span style="font-size:11px; color:#A9A39A; display:block; margin-top:2px;">Until 11:00 AM</span>
                  </td>
                </tr>

                <!-- Guest & Duration -->
                <tr>
                  <td style="padding: 16px 0; border-bottom:1px solid #302D28;">
                    <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.18em; color:#A9A39A; display:block; margin-bottom:4px;">Duration</span>
                    <span style="font-size:13px; color:#F4EFE5;">${nights} Night${nights > 1 ? "s" : ""}</span>
                  </td>
                  <td style="padding: 16px 0; border-bottom:1px solid #302D28;">
                    <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.18em; color:#A9A39A; display:block; margin-bottom:4px;">Guests</span>
                    <span style="font-size:13px; color:#F4EFE5;">${booking.guests} Guest${booking.guests > 1 ? "s" : ""}</span>
                  </td>
                </tr>

                <!-- Guest Info -->
                <tr>
                  <td colspan="2" style="padding: 16px 0; border-bottom:1px solid #302D28;">
                    <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.18em; color:#A9A39A; display:block; margin-bottom:6px;">Primary Guest Credentials</span>
                    <span style="font-size:13px; color:#F4EFE5; display:block; font-weight:500;">${booking.guestName}</span>
                    <span style="font-size:12px; color:#A9A39A; display:block; margin-top:2px;">${booking.guestEmail} • ${booking.guestPhone}</span>
                  </td>
                </tr>

                <!-- Price Authority -->
                <tr>
                  <td style="padding-top: 16px;">
                    <span style="font-size:11px; color:#A9A39A;">Rate (₹${pricePerNight.toLocaleString("en-IN")} × ${nights} nights)</span>
                  </td>
                  <td align="right" style="padding-top: 16px;">
                    <span style="font-family:Georgia, serif; font-size:20px; font-weight:600; color:#C89B4A;">
                      ₹${booking.totalAmount?.toLocaleString("en-IN")}
                    </span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align:center;">
              <a href="${customerBookingUrl}" target="_blank" style="display:inline-block; padding: 14px 32px; background-color:#C89B4A; color:#0B0B0A; text-decoration:none; font-size:12px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; border-radius:8px;">
                VIEW MY BOOKING &rarr;
              </a>
            </td>
          </tr>

          <!-- Terms & Concierge Footer -->
          <tr>
            <td style="padding: 24px 40px 36px 40px; background-color:#0F0E0D; border-top:1px solid #302D28; font-size:11px; color:#8C857B; leading-height:1.6;">
              <strong style="color:#A9A39A; font-weight:600; display:block; margin-bottom:4px;">Cancellation & Concierge Policy:</strong>
              Cancellations requested up to 14 days prior to check-in qualify for a full refund subject to concierge terms. For questions regarding your stay, contact our team at <a href="mailto:concierge@darangavilla.com" style="color:#C89B4A; text-decoration:none;">concierge@darangavilla.com</a>.
              <br><br>
              © Daranga Villa Sanctuary. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate Admin Notification HTML Email
 */
export function generateAdminNotificationEmailHtml(
  booking: BookingEmailData,
  baseUrl: string
): string {
  const villaObj =
    booking.villaId && typeof booking.villaId === "object"
      ? (booking.villaId as { name?: string; title?: string; location?: string; city?: string })
      : booking.villa || undefined;

  const bookingRef = `#${(booking._id || booking.id || "").toString().slice(-8).toUpperCase()}`;
  const villaName =
    villaObj?.title || villaObj?.name || "Daranga Villa Sanctuary";

  const checkInStr = new Date(booking.checkIn).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const checkOutStr = new Date(booking.checkOut).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif; background:#151412; color:#F4EFE5; padding:20px;">
  <div style="max-width:550px; margin:0 auto; background:#1C1A17; border:1px solid #302D28; padding:24px; border-radius:12px;">
    <h2 style="color:#C89B4A; margin-top:0; font-family:Georgia, serif;">[Admin Alert] New Confirmed Booking Received</h2>
    <p style="font-size:13px; color:#A9A39A;">A new verified stay payment has been processed for <strong>${villaName}</strong>.</p>
    
    <table width="100%" style="font-size:12px; border-collapse:collapse; margin-top:16px;">
      <tr><td style="padding:6px 0; color:#A9A39A;">Booking Ref:</td><td style="font-weight:bold; color:#C89B4A;">${bookingRef}</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Villa:</td><td>${villaName}</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Dates:</td><td>${checkInStr} → ${checkOutStr}</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Guests:</td><td>${booking.guests} Guests</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Guest Name:</td><td>${booking.guestName}</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Guest Email:</td><td>${booking.guestEmail}</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Guest Phone:</td><td>${booking.guestPhone}</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Total Amount:</td><td style="font-size:15px; font-weight:bold; color:#34D399;">₹${booking.totalAmount?.toLocaleString("en-IN")}</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Razorpay Payment ID:</td><td style="font-family:monospace;">${booking.razorpayPaymentId || "Verified"}</td></tr>
      <tr><td style="padding:6px 0; color:#A9A39A;">Status:</td><td>CONFIRMED (PAID)</td></tr>
    </table>

    <div style="margin-top:20px; text-align:center;">
      <a href="${baseUrl}/admin/bookings" style="display:inline-block; padding:10px 20px; background:#C89B4A; color:#0B0B0A; text-decoration:none; font-weight:bold; border-radius:6px; font-size:11px; text-transform:uppercase;">View Admin Dashboard</a>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Idempotent Email Trigger Function.
 * Safely claims confirmation email dispatch for a confirmed, paid booking.
 * Guarantees that retried webhooks or repeated calls will NOT send duplicate emails.
 */
export async function triggerBookingConfirmationEmails(bookingId: string): Promise<{
  sent: boolean;
  reason?: string;
  error?: string;
}> {
  try {
    await connectToDatabase();

    // 1. Atomic Idempotent Claim: Set confirmationEmailStatus to SENT only if it is NOT_SENT or FAILED
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        confirmationEmailStatus: { $ne: "SENT" },
      },
      {
        $set: {
          confirmationEmailStatus: "SENT",
          confirmationEmailSentAt: new Date(),
        },
      },
      { new: true }
    ).populate("villaId");

    if (!booking) {
      return {
        sent: false,
        reason: "ALREADY_SENT_OR_NOT_CONFIRMED",
      };
    }

    const baseUrl = getSiteBaseUrl();
    const customerSubject = `Booking Confirmed — Daranga Villa | #${(booking._id || booking.id || "").toString().slice(-8).toUpperCase()}`;
    const customerHtml = generateCustomerConfirmationEmailHtml(booking, baseUrl);

    // 2. Dispatch Customer Confirmation Email
    const customerResult = await sendEmail({
      to: booking.guestEmail,
      subject: customerSubject,
      html: customerHtml,
    });

    // 3. Dispatch Admin Notification Email
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "admin@darangavilla.com";
    const villaObj =
      booking.villaId && typeof booking.villaId === "object"
        ? (booking.villaId as { title?: string; name?: string })
        : null;
    const villaName = villaObj?.title || villaObj?.name || "Villa Sanctuary";
    const adminSubject = `[New Booking Confirmed] ${villaName} — ${booking.guestName} | #${(booking._id || booking.id || "").toString().slice(-8).toUpperCase()}`;
    const adminHtml = generateAdminNotificationEmailHtml(booking, baseUrl);

    await sendEmail({
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    });

    if (!customerResult.success) {
      // Record failure state in MongoDB without modifying confirmed/paid payment status!
      await Booking.updateOne(
        { _id: bookingId },
        { $set: { confirmationEmailStatus: "FAILED" } }
      );
      return {
        sent: false,
        error: customerResult.error || "Email delivery failed",
      };
    }

    return { sent: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error sending emails";
    console.error(`Failed to trigger confirmation emails for ${bookingId}:`, errorMsg);

    try {
      await Booking.updateOne(
        { _id: bookingId },
        { $set: { confirmationEmailStatus: "FAILED" } }
      );
    } catch {
      // Ignore DB update error during emergency catch
    }

    // Return sent: false, but preserve confirmed payment status in DB!
    return { sent: false, error: errorMsg };
  }
}
