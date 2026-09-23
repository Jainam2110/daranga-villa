import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import BlockedDate from "@/models/BlockedDate";
import Booking from "@/models/Booking";
import Villa from "@/models/Villa";
import { normalizeDateToUTCMidnight } from "@/lib/booking/availability";

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin privileges required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const villaId = searchParams.get("villaId");

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (villaId && mongoose.Types.ObjectId.isValid(villaId)) {
      query.villaId = new mongoose.Types.ObjectId(villaId);
    }

    const blockedDates = await BlockedDate.find(query)
      .populate("villaId", "name slug")
      .sort({ startDate: 1 })
      .lean();

    return NextResponse.json(
      { success: true, count: blockedDates.length, data: blockedDates },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { villaId, startDate, endDate, reason } = body;

    if (!villaId || !mongoose.Types.ObjectId.isValid(villaId)) {
      return NextResponse.json(
        { success: false, error: "Valid Villa ID is required." },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "startDate and endDate are required." },
        { status: 400 }
      );
    }

    const start = normalizeDateToUTCMidnight(startDate);
    const end = normalizeDateToUTCMidnight(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: "startDate and endDate must be valid dates." },
        { status: 400 }
      );
    }

    if (start.getTime() >= end.getTime()) {
      return NextResponse.json(
        { success: false, error: "startDate must be strictly before endDate." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify Villa exists
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return NextResponse.json(
        { success: false, error: "Villa not found." },
        { status: 404 }
      );
    }

    // CHECK OVERLAP WITH ACTIVE BOOKINGS:
    // Admin must not accidentally block dates that already contain an active booking.
    const conflictingBookingsCount = await Booking.countDocuments({
      villaId: new mongoose.Types.ObjectId(villaId),
      status: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (conflictingBookingsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot block dates that overlap an existing active booking. Please check booking details.",
        },
        { status: 409 }
      );
    }

    // Check overlap with existing blocked dates
    const conflictingBlocksCount = await BlockedDate.countDocuments({
      villaId: new mongoose.Types.ObjectId(villaId),
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (conflictingBlocksCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected dates already overlap with an existing blocked date range.",
        },
        { status: 409 }
      );
    }

    const newBlockedDate = await BlockedDate.create({
      villaId: new mongoose.Types.ObjectId(villaId),
      startDate: start,
      endDate: end,
      reason: reason ? String(reason).trim() : "Maintenance / Owner Hold",
      createdBy: new mongoose.Types.ObjectId(admin.userId),
    });

    return NextResponse.json(
      { success: true, data: newBlockedDate },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create blocked date";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
