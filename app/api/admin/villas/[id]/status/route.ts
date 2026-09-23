import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Villa from "@/models/Villa";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Villa ObjectId format." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status must be either 'ACTIVE' or 'INACTIVE'." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const villa = await Villa.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!villa) {
      return NextResponse.json(
        { success: false, error: "Villa not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: villa },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Status update failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
