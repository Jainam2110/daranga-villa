import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Villa from "@/models/Villa";
import Booking from "@/models/Booking";
import BlockedDate from "@/models/BlockedDate";
import { buildOverlapBookingQuery } from "./overlapQuery";
export { buildOverlapBookingQuery };
export interface CheckAvailabilityParams {
  villaId: string;
  checkIn: string | Date;
  checkOut: string | Date;
  guests?: number;
  excludeBookingId?: string;
  allowPastDatesForAdmin?: boolean;
}

export interface AvailabilityResult {
  available: boolean;
  villaId: string;
  villaName?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  conflictingBookingsCount: number;
  conflictingBlockedDatesCount: number;
  error?: string;
  errorCode?:
    | "INVALID_DATES"
    | "SAME_DATE"
    | "PAST_DATE"
    | "VILLA_NOT_FOUND"
    | "VILLA_INACTIVE"
    | "EXCEEDS_CAPACITY"
    | "DATE_UNAVAILABLE"
    | "SERVER_ERROR";
}

/**
 * Format a Date object as YYYY-MM-DD string.
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Normalize date input to UTC Midnight (00:00:00.000Z).
 */
export function normalizeDateToUTCMidnight(input: string | Date): Date {
  const d = typeof input === "string" ? new Date(input) : new Date(input.getTime());
  if (isNaN(d.getTime())) {
    return new Date(NaN);
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Retrieve the payment hold duration in minutes from process.env.PAYMENT_HOLD_MINUTES (defaults to 15).
 */
export function getPaymentHoldDurationMinutes(): number {
  const envVal = process.env.PAYMENT_HOLD_MINUTES;
  if (envVal) {
    const parsed = parseInt(envVal.trim(), 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 15;
}

/**
 * Calculate the server-authoritative payment hold expiry Date.
 */
export function calculatePaymentHoldExpiry(startDate: Date = new Date()): Date {
  const minutes = getPaymentHoldDurationMinutes();
  return new Date(startDate.getTime() + minutes * 60 * 1000);
}

/**
 * Central Server-Side Source of Truth for Villa Booking Availability.
 */
export async function checkVillaAvailability(
  params: CheckAvailabilityParams
): Promise<AvailabilityResult> {
  const {
    villaId,
    checkIn: rawCheckIn,
    checkOut: rawCheckOut,
    guests,
    excludeBookingId,
    allowPastDatesForAdmin = false,
  } = params;

  // 1. Validate Villa ObjectId
  if (!villaId || !mongoose.Types.ObjectId.isValid(villaId)) {
    return {
      available: false,
      villaId: villaId || "",
      checkIn: "",
      checkOut: "",
      numberOfNights: 0,
      pricePerNight: 0,
      totalAmount: 0,
      conflictingBookingsCount: 0,
      conflictingBlockedDatesCount: 0,
      error: `Invalid Villa ID format '${villaId}'.`,
      errorCode: "VILLA_NOT_FOUND",
    };
  }

  // 2. Normalize and validate Dates
  const checkInDate = normalizeDateToUTCMidnight(rawCheckIn);
  const checkOutDate = normalizeDateToUTCMidnight(rawCheckOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return {
      available: false,
      villaId,
      checkIn: "",
      checkOut: "",
      numberOfNights: 0,
      pricePerNight: 0,
      totalAmount: 0,
      conflictingBookingsCount: 0,
      conflictingBlockedDatesCount: 0,
      error: "Check-in and Check-out must be valid dates (e.g. YYYY-MM-DD).",
      errorCode: "INVALID_DATES",
    };
  }

  if (checkInDate.getTime() === checkOutDate.getTime()) {
    return {
      available: false,
      villaId,
      checkIn: formatDateISO(checkInDate),
      checkOut: formatDateISO(checkOutDate),
      numberOfNights: 0,
      pricePerNight: 0,
      totalAmount: 0,
      conflictingBookingsCount: 0,
      conflictingBlockedDatesCount: 0,
      error: "Check-in and Check-out cannot be on the same date.",
      errorCode: "SAME_DATE",
    };
  }

  if (checkInDate.getTime() > checkOutDate.getTime()) {
    return {
      available: false,
      villaId,
      checkIn: formatDateISO(checkInDate),
      checkOut: formatDateISO(checkOutDate),
      numberOfNights: 0,
      pricePerNight: 0,
      totalAmount: 0,
      conflictingBookingsCount: 0,
      conflictingBlockedDatesCount: 0,
      error: "Check-in date must be strictly before Check-out date.",
      errorCode: "INVALID_DATES",
    };
  }

  // Check if booking is in the past (unless allowed for historical admin entries)
  if (!allowPastDatesForAdmin) {
    const todayUTCMidnight = normalizeDateToUTCMidnight(new Date());
    if (checkInDate.getTime() < todayUTCMidnight.getTime()) {
      return {
        available: false,
        villaId,
        checkIn: formatDateISO(checkInDate),
        checkOut: formatDateISO(checkOutDate),
        numberOfNights: 0,
        pricePerNight: 0,
        totalAmount: 0,
        conflictingBookingsCount: 0,
        conflictingBlockedDatesCount: 0,
        error: "Check-in date cannot be in the past.",
        errorCode: "PAST_DATE",
      };
    }
  }

  const numberOfNights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 3. Connect to DB & Find Villa
  await connectToDatabase();
  const villa = await Villa.findById(villaId).lean();

  if (!villa) {
    return {
      available: false,
      villaId,
      checkIn: formatDateISO(checkInDate),
      checkOut: formatDateISO(checkOutDate),
      numberOfNights,
      pricePerNight: 0,
      totalAmount: 0,
      conflictingBookingsCount: 0,
      conflictingBlockedDatesCount: 0,
      error: `Villa with ID '${villaId}' was not found.`,
      errorCode: "VILLA_NOT_FOUND",
    };
  }

  if (villa.status !== "ACTIVE") {
    return {
      available: false,
      villaId,
      villaName: villa.name,
      checkIn: formatDateISO(checkInDate),
      checkOut: formatDateISO(checkOutDate),
      numberOfNights,
      pricePerNight: villa.pricePerNight,
      totalAmount: numberOfNights * villa.pricePerNight,
      conflictingBookingsCount: 0,
      conflictingBlockedDatesCount: 0,
      error: `Villa '${villa.name}' is currently INACTIVE and not available for booking.`,
      errorCode: "VILLA_INACTIVE",
    };
  }

  // 4. Validate Guest Capacity (if provided)
  if (guests !== undefined) {
    if (guests < 1) {
      return {
        available: false,
        villaId,
        villaName: villa.name,
        checkIn: formatDateISO(checkInDate),
        checkOut: formatDateISO(checkOutDate),
        numberOfNights,
        pricePerNight: villa.pricePerNight,
        totalAmount: numberOfNights * villa.pricePerNight,
        conflictingBookingsCount: 0,
        conflictingBlockedDatesCount: 0,
        error: "Guest count must be at least 1.",
        errorCode: "EXCEEDS_CAPACITY",
      };
    }
    if (guests > villa.maxGuests) {
      return {
        available: false,
        villaId,
        villaName: villa.name,
        checkIn: formatDateISO(checkInDate),
        checkOut: formatDateISO(checkOutDate),
        numberOfNights,
        pricePerNight: villa.pricePerNight,
        totalAmount: numberOfNights * villa.pricePerNight,
        conflictingBookingsCount: 0,
        conflictingBlockedDatesCount: 0,
        error: `Requested guest count (${guests}) exceeds maximum allowed capacity (${villa.maxGuests}) for '${villa.name}'.`,
        errorCode: "EXCEEDS_CAPACITY",
      };
    }
  }



  // 5. Check Booking Overlaps
  const overlapBookingQuery = buildOverlapBookingQuery(villaId, checkInDate, checkOutDate, excludeBookingId);
  const conflictingBookingsCount = await Booking.countDocuments(overlapBookingQuery);

  // 6. Check Blocked Dates
  const overlapBlockedDateQuery = {
    villaId,
    startDate: { $lt: checkOutDate },
    endDate: { $gt: checkInDate },
  };

  const conflictingBlockedDatesCount = await BlockedDate.countDocuments(overlapBlockedDateQuery);

  const isAvailable = conflictingBookingsCount === 0 && conflictingBlockedDatesCount === 0;
  const pricePerNight = villa.pricePerNight;
  const totalAmount = numberOfNights * pricePerNight;

  if (!isAvailable) {
    let conflictDetail = "The selected dates overlap with an existing booking or owner block.";
    if (conflictingBookingsCount > 0 && conflictingBlockedDatesCount > 0) {
      conflictDetail = "Selected dates overlap with an existing booking and blocked dates.";
    } else if (conflictingBlockedDatesCount > 0) {
      conflictDetail = "Selected dates are blocked for maintenance or owner hold.";
    }

    return {
      available: false,
      villaId,
      villaName: villa.name,
      checkIn: formatDateISO(checkInDate),
      checkOut: formatDateISO(checkOutDate),
      numberOfNights,
      pricePerNight,
      totalAmount,
      conflictingBookingsCount,
      conflictingBlockedDatesCount,
      error: conflictDetail,
      errorCode: "DATE_UNAVAILABLE",
    };
  }

  return {
    available: true,
    villaId,
    villaName: villa.name,
    checkIn: formatDateISO(checkInDate),
    checkOut: formatDateISO(checkOutDate),
    numberOfNights,
    pricePerNight,
    totalAmount,
    conflictingBookingsCount: 0,
    conflictingBlockedDatesCount: 0,
  };
}
