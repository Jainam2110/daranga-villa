import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import "@/models/Villa";
import {
  verifyCustomerFromHeader,
  isBookingOwnedByCustomer,
} from "@/lib/auth/customer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID format." },
        { status: 400 }
      );
    }

    const authResult = await verifyCustomerFromHeader(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access booking details." },
        { status: 401 }
      );
    }

    const { customer } = authResult;

    await connectToDatabase();

    const booking = await Booking.findById(id)
      .populate("villaId", "title name slug location images heroImage pricePerNight address city bedrooms bathrooms maxGuests amenities")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    // Ownership Enforcement
    if (!isBookingOwnedByCustomer(booking, customer)) {
      return NextResponse.json(
        { success: false, error: "Access denied. You are not authorized to view this booking." },
        { status: 403 }
      );
    }

    const checkInISO = booking.checkIn ? new Date(booking.checkIn).toISOString() : "";
    const checkOutISO = booking.checkOut ? new Date(booking.checkOut).toISOString() : "";
    const createdAtISO = booking.createdAt ? new Date(booking.createdAt).toISOString() : "";
    const paymentHoldExpiresAtISO = booking.paymentHoldExpiresAt
      ? new Date(booking.paymentHoldExpiresAt).toISOString()
      : undefined;

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id.toString(),
        _id: booking._id.toString(),
        villa: booking.villaId || null,
        villaId: typeof booking.villaId === "object" && booking.villaId !== null && "_id" in booking.villaId
          ? (booking.villaId as { _id: mongoose.Types.ObjectId })._id.toString()
          : String(booking.villaId),
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        checkIn: checkInISO,
        checkOut: checkOutISO,
        guests: booking.guests,
        totalAmount: booking.totalAmount,
        source: booking.source,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        razorpayOrderId: booking.razorpayOrderId || undefined,
        razorpayPaymentId: booking.razorpayPaymentId || undefined,
        paymentHoldExpiresAt: paymentHoldExpiresAtISO,
        notes: booking.notes || "",
        createdAt: createdAtISO,
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Customer Booking Details API Error:", error);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
