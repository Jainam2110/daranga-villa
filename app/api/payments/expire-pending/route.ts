import { NextResponse } from "next/server";
import { expirePendingBookings } from "@/lib/booking/expire-pending-bookings";

/**
 * Handle pending booking expiration triggers from Vercel Cron or administrative tasks.
 * Secured with CRON_SECRET authorization header when configured.
 */
async function handleExpirePending(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET?.trim();
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: "Unauthorized. Invalid or missing CRON_SECRET token." },
          { status: 401 }
        );
      }
    }

    const result = await expirePendingBookings();

    return NextResponse.json(
      {
        success: true,
        modifiedCount: result.modifiedCount || 0,
        acknowledged: result.acknowledged,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Error expiring pending bookings";
    console.error("Cron Expire Pending API Error:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return handleExpirePending(request);
}

export async function GET(request: Request) {
  return handleExpirePending(request);
}
