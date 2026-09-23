import { NextResponse } from "next/server";
import { checkVillaAvailability, formatDateISO } from "@/lib/booking/availability";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import BlockedDate from "@/models/BlockedDate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guestsRaw = searchParams.get("guests");

    // If checkIn and checkOut are omitted, return all blocked/booked date ranges for this villa
    if (!checkIn || !checkOut) {
      await connectToDatabase();

      const now = new Date();
      const activeBookings = await Booking.find({
        villaId: id,
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
      })
        .select("checkIn checkOut")
        .lean();

      const blockedDates = await BlockedDate.find({
        villaId: id,
      })
        .select("startDate endDate")
        .lean();

      const blockedRanges = [
        ...activeBookings.map((b) => ({
          startDate: formatDateISO(new Date(b.checkIn)),
          endDate: formatDateISO(new Date(b.checkOut)),
          type: "BOOKING",
        })),
        ...blockedDates.map((d) => ({
          startDate: formatDateISO(new Date(d.startDate)),
          endDate: formatDateISO(new Date(d.endDate)),
          type: "BLOCKED",
        })),
      ];

      return NextResponse.json({
        success: true,
        blockedRanges,
      });
    }

    const guests = guestsRaw ? parseInt(guestsRaw, 10) : undefined;
    if (guestsRaw !== null && (isNaN(guests!) || guests! < 1)) {
      return NextResponse.json(
        { success: false, error: "Guest count must be a positive number." },
        { status: 400 }
      );
    }

    const result = await checkVillaAvailability({
      villaId: id,
      checkIn,
      checkOut,
      guests,
    });

    if (!result.available) {
      let statusCode = 409;
      if (result.errorCode === "VILLA_NOT_FOUND") {
        statusCode = 404;
      } else if (
        result.errorCode === "INVALID_DATES" ||
        result.errorCode === "SAME_DATE" ||
        result.errorCode === "PAST_DATE" ||
        result.errorCode === "EXCEEDS_CAPACITY"
      ) {
        statusCode = 400;
      }

      return NextResponse.json(
        {
          success: false,
          available: false,
          data: result,
          error: result.error,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        available: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected server error occurred";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
