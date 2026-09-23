import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Villa from "@/models/Villa";
import {
  checkVillaAvailability,
  normalizeDateToUTCMidnight,
  calculatePaymentHoldExpiry,
} from "@/lib/booking/availability";

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
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");

    await connectToDatabase();

    const query: Record<string, unknown> = {};

    if (villaId && mongoose.Types.ObjectId.isValid(villaId)) {
      query.villaId = new mongoose.Types.ObjectId(villaId);
    }

    if (status && ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      query.status = status;
    }

    if (paymentStatus && ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"].includes(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      const searchConditions: Record<string, unknown>[] = [
        { guestName: searchRegex },
        { guestEmail: searchRegex },
        { guestPhone: searchRegex },
      ];

      if (mongoose.Types.ObjectId.isValid(search.trim())) {
        searchConditions.push({ _id: new mongoose.Types.ObjectId(search.trim()) });
      }

      query.$or = searchConditions;
    }

    const bookings = await Booking.find(query)
      .populate("villaId", "name title slug location pricePerNight images heroImage address city")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, count: bookings.length, data: bookings },
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
    const {
      villaId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests,
      notes,
      source,
      paymentStatus,
    } = body;

    // 1. Basic Server-side Input Validation
    if (!villaId || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || guests === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Required fields missing: villaId, guestName, guestEmail, guestPhone, checkIn, checkOut, and guests are required.",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(villaId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Villa ID format." },
        { status: 400 }
      );
    }

    if (typeof guestName !== "string" || !guestName.trim()) {
      return NextResponse.json(
        { success: false, error: "Guest name must be a non-empty string." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail.trim())) {
      return NextResponse.json(
        { success: false, error: "Guest email format is invalid." },
        { status: 400 }
      );
    }

    const parsedGuests = Number(guests);
    if (isNaN(parsedGuests) || parsedGuests < 1) {
      return NextResponse.json(
        { success: false, error: "Guest count must be at least 1." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Validate Villa Existence & Status
    const targetVilla = await Villa.findById(villaId);
    if (!targetVilla) {
      return NextResponse.json(
        { success: false, error: "Target Villa residence not found." },
        { status: 404 }
      );
    }

    if (targetVilla.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Cannot create manual booking for an INACTIVE villa." },
        { status: 400 }
      );
    }

    if (parsedGuests > targetVilla.maxGuests) {
      return NextResponse.json(
        {
          success: false,
          error: `Guest count (${parsedGuests}) exceeds maximum villa capacity (${targetVilla.maxGuests}).`,
        },
        { status: 400 }
      );
    }

    // 3. Server-side Pre-Insert Availability Validation
    const availability = await checkVillaAvailability({
      villaId,
      checkIn,
      checkOut,
      guests: parsedGuests,
    });

    if (!availability.available) {
      return NextResponse.json(
        {
          success: false,
          error: availability.error || "Selected dates are not available for booking.",
          availability,
        },
        { status: 409 }
      );
    }

    // 4. Server-Calculated Price Authority
    const serverTotalAmount = availability.totalAmount;
    const checkInDate = normalizeDateToUTCMidnight(checkIn);
    const checkOutDate = normalizeDateToUTCMidnight(checkOut);

    const isPaid = paymentStatus === "PAID";
    const finalBookingStatus = isPaid ? "CONFIRMED" : "PENDING";
    const finalPaymentStatus = isPaid ? "PAID" : "UNPAID";

    // Valid booking sources
    const allowedSources = ["WEBSITE", "AIRBNB", "BOOKING_COM", "PHONE", "WHATSAPP", "ADMIN"];
    const finalSource = source && allowedSources.includes(source) ? source : "ADMIN";

    const paymentHoldExpiresAt = !isPaid ? calculatePaymentHoldExpiry() : undefined;

    // 5. Create Manual Booking Document
    const newBooking = await Booking.create({
      villaId: new mongoose.Types.ObjectId(villaId),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: parsedGuests,
      totalAmount: serverTotalAmount,
      source: finalSource,
      status: finalBookingStatus,
      paymentStatus: finalPaymentStatus,
      paymentHoldExpiresAt,
      notes: notes ? String(notes).trim() : `Manual booking created by admin (${admin.email})`,
    });

    const populated = await Booking.findById(newBooking._id)
      .populate("villaId", "name title slug location pricePerNight images heroImage address city")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Manual booking created successfully.",
        data: populated,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create manual booking";
    console.error("Admin Manual Booking Creation Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
