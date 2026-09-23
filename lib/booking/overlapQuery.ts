// lib/booking/overlapQuery.ts
// Helper to build MongoDB query for overlapping bookings, used by availability checks.
// Extracted from availability.ts to avoid ESBuild export issues.

import mongoose from "mongoose";

export function buildOverlapBookingQuery(
  villaId: string,
  checkInDate: Date,
  checkOutDate: Date,
  excludeBookingId?: string
): Record<string, unknown> {
  const now = new Date();
  const query: Record<string, unknown> = {
    villaId,
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
    $or: [
      { status: { $in: ["CONFIRMED", "COMPLETED"] } },
      {
        status: "PENDING",
        $or: [
          { paymentHoldExpiresAt: { $exists: false } },
          { paymentHoldExpiresAt: null },
          { paymentHoldExpiresAt: { $gt: now } },
        ],
      },
    ],
  };

  if (excludeBookingId && mongoose.Types.ObjectId.isValid(excludeBookingId)) {
    (query as Record<string, unknown> & { _id?: { $ne: string } })._id = { $ne: excludeBookingId };
  }

  return query;
}
