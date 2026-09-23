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
        { success: false, error: `Invalid Booking ID format '${id}'.` },
        { status: 400 }
      );
    }

    const authResult = await verifyCustomerFromHeader(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: "Authentication token required to view booking." },
        { status: 401 }
      );
    }

    const { customer } = authResult;

    await connectToDatabase();

    const booking = await Booking.findById(id)
      .populate("villaId", "title name slug location images heroImage pricePerNight address city")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with ID '${id}' was not found.` },
        { status: 404 }
      );
    }

    if (!isBookingOwnedByCustomer(booking, customer)) {
      return NextResponse.json(
        { success: false, error: "Access denied. You are not authorized to view this booking." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
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
