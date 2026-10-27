import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const apiKey = (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || "").trim();
    const rawFrom = process.env.EMAIL_FROM || "Daranga Villas <reservations@darangavillas.com>";
    const fromAddress = rawFrom.replace(/^["']|["']$/g, "").trim();
    const adminNotificationEmail =
      process.env.BOOKING_NOTIFICATION_EMAIL?.trim() || "Darangavillas@gmail.com";

    return NextResponse.json({
      success: true,
      config: {
        hasApiKey: Boolean(apiKey),
        apiKeyPreview: apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "NOT_CONFIGURED",
        fromAddress,
        adminNotificationEmail,
        environment: process.env.NODE_ENV,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const targetEmail =
      body.to?.trim() ||
      process.env.BOOKING_NOTIFICATION_EMAIL?.trim() ||
      "Darangavillas@gmail.com";

    const apiKey = (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || "").trim();
    const rawFrom = process.env.EMAIL_FROM || "Daranga Villas <reservations@darangavillas.com>";
    const fromAddress = rawFrom.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "RESEND_API_KEY is not defined in server environment variables. Please add your Resend API key to .env.local (and Vercel Environment Variables).",
          config: { hasApiKey: false, fromAddress, targetEmail },
        },
        { status: 400 }
      );
    }

    const emailResult = await sendEmail({
      to: targetEmail,
      subject: "Daranga Villa — Email System Delivery Test",
      html: `
        <div style="font-family:sans-serif; padding:20px; background:#F7F6F3;">
          <div style="max-width:500px; margin:0 auto; background:#FFFFFF; padding:24px; border-radius:8px; border:1px solid #E8E6E2;">
            <h2 style="margin-top:0; color:#202020;">Email Delivery System Test</h2>
            <p style="color:#666;">This test email confirms that Resend API dispatch is working successfully.</p>
            <table style="width:100%; font-size:12px; margin-top:16px;">
              <tr><td style="color:#666;">Sender:</td><td><strong>${fromAddress}</strong></td></tr>
              <tr><td style="color:#666;">Recipient:</td><td><strong>${targetEmail}</strong></td></tr>
              <tr><td style="color:#666;">Timestamp:</td><td>${new Date().toISOString()}</td></tr>
            </table>
          </div>
        </div>
      `,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error,
          hint: emailResult.error?.includes("domain")
            ? "Your sender domain is not verified in Resend. Please verify DNS records for your domain at https://resend.com/domains or use onboarding@resend.dev for testing."
            : undefined,
          config: { fromAddress, targetEmail },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email successfully dispatched to ${targetEmail}`,
      messageId: emailResult.messageId,
      config: { fromAddress, targetEmail },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal Error" },
      { status: 500 }
    );
  }
}
