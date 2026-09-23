import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

/**
 * Server-side helper to safely update expired unpaid PENDING bookings to CANCELLED.
 * Note: Availability logic does NOT rely on this running to free inventory
 * (availability query already filters out expired holds automatically), but this
 * cleans up database records for historical and admin reporting.
 */
export async function expirePendingBookings() {
  try {
    await connectToDatabase();
    const now = new Date();

    const result = await Booking.updateMany(
      {
        status: "PENDING",
        paymentStatus: { $ne: "PAID" },
        paymentHoldExpiresAt: { $lte: now },
      },
      {
        $set: {
          status: "CANCELLED",
        },
      }
    );

    // Return the full result for caller inspection (including modifiedCount)
    return result;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error expiring pending bookings";
    console.error("expirePendingBookings failed:", msg);
    // Return an object mimicking UpdateResult with zero modifications on failure
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}
