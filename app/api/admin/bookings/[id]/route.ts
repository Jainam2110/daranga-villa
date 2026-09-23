import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import "@/models/Villa";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin privileges required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID format." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await Booking.findById(id)
      .populate("villaId", "name title slug location pricePerNight images heroImage address city")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: booking },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin privileges required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID format." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    await connectToDatabase();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    const updateFields: Record<string, unknown> = {};

    if (status && ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      updateFields.status = status;
      if (status === "CANCELLED") {
        updateFields.paymentHoldExpiresAt = undefined;
      }
    }

    if (paymentStatus && ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"].includes(paymentStatus)) {
      updateFields.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      updateFields.notes = String(notes).trim();
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    )
      .populate("villaId", "name title slug location pricePerNight images heroImage address city")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: status === "CANCELLED" ? "Booking cancelled and inventory released." : "Booking updated successfully.",
        data: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin privileges required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID format." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Safe cancellation flow: update status to CANCELLED instead of hard deleting
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "CANCELLED",
        },
        $unset: {
          paymentHoldExpiresAt: 1,
        },
      },
      { new: true }
    )
      .populate("villaId", "name title slug location pricePerNight images heroImage address city")
      .lean();

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking cancelled successfully. Inventory released.",
        data: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
