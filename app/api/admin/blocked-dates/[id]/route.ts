import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import BlockedDate from "@/models/BlockedDate";

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
        { success: false, error: "Invalid BlockedDate ID format." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedBlock = await BlockedDate.findByIdAndDelete(id);

    if (!deletedBlock) {
      return NextResponse.json(
        { success: false, error: "BlockedDate not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Blocked date range removed successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Deletion failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
