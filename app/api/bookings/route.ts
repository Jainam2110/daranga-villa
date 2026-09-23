import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { checkVillaAvailability, normalizeDateToUTCMidnight, calculatePaymentHoldExpiry } from "@/lib/booking/availability";

/**
 * DOUBLE-BOOKING SAFETY & CONCURRENCY ARCHITECTURE NOTES:
 * 
 * 1. Immediate Pre-Insert Check:
 *    The server performs a fresh availability validation (`checkVillaAvailability`)
 *    immediately prior to creating the booking document. This prevents double-booking
 *    at the application layer for all standard web traffic.
 * 
 * 2. Race Condition Window (MongoDB Concurrency Limit):
 *    In high-concurrency environments with simultaneous requests arriving at the exact
 *    same millisecond, a race condition can theoretically occur between the availability
 *    query and the `Booking.create()` insert.
 * 
 * 3. Future Payment / Razorpay Integration Hold Strategy:
 *    When Razorpay payment integration is introduced in the next phase, the flow will
 *    create a 10-minute temporary hold (Booking with status: "PENDING", paymentStatus: "PENDING").
 *    Because `checkVillaAvailability` already treats "PENDING" bookings as active inventory holds,
 *    unpaid temporary holds will naturally block double-bookings during checkout without requiring
 *    any modifications to the underlying availability engine or Booking model schema.
 * 
 * 4. Production Hardening:
 *    For absolute zero-race-condition guarantees in production, a Mongoose transaction session
 *    (`startSession()`) or a unique compound index holding date slots can be applied.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      villaId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests,
      customerId,
      notes,
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

    // 2. Server-side Pre-Insert Availability Validation
    const availability = await checkVillaAvailability({
      villaId,
      checkIn,
      checkOut,
      guests: parsedGuests,
    });

    if (!availability.available) {
      let statusCode = 409;
      if (availability.errorCode === "VILLA_NOT_FOUND") {
        statusCode = 404;
      } else if (
        availability.errorCode === "INVALID_DATES" ||
        availability.errorCode === "SAME_DATE" ||
        availability.errorCode === "PAST_DATE" ||
        availability.errorCode === "EXCEEDS_CAPACITY"
      ) {
        statusCode = 400;
      }

      return NextResponse.json(
        {
          success: false,
          error: availability.error || "Selected dates are not available for booking.",
          availability,
        },
        { status: statusCode }
      );
    }

    // 3. Price Authority: Total amount is calculated on server from Villa DB price
    // We NEVER trust frontend-supplied prices.
    const serverTotalAmount = availability.totalAmount;
    const checkInDate = normalizeDateToUTCMidnight(checkIn);
    const checkOutDate = normalizeDateToUTCMidnight(checkOut);

    await connectToDatabase();

    // 4. Create Booking Document in MongoDB with Temporary Payment Hold Expiry
    const paymentHoldExpiresAt = calculatePaymentHoldExpiry();

    const newBooking = await Booking.create({
      villaId: new mongoose.Types.ObjectId(villaId),
      customerId: customerId && mongoose.Types.ObjectId.isValid(customerId)
        ? new mongoose.Types.ObjectId(customerId)
        : undefined,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: parsedGuests,
      totalAmount: serverTotalAmount,
      source: "WEBSITE",
      status: "PENDING",
      paymentStatus: "UNPAID",
      paymentHoldExpiresAt,
      notes: notes ? String(notes).trim() : "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking request created successfully.",
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create booking request";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
