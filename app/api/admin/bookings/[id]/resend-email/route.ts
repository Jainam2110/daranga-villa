import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { triggerBookingConfirmationEmails } from "@/lib/email";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
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
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    // Force reset status to NOT_SENT if admin requests manual resend
    if (booking.confirmationEmailStatus === "SENT") {
      await Booking.updateOne({ _id: id }, { $set: { confirmationEmailStatus: "NOT_SENT" } });
    }

    const result = await triggerBookingConfirmationEmails(id);

    const updatedBooking = await Booking.findById(id).lean();

    if (!result.sent) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to deliver booking confirmation emails.",
          booking: updatedBooking,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Confirmation emails dispatched successfully.",
      booking: updatedBooking,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal Error" },
      { status: 500 }
    );
  }
}
