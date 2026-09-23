import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Villa from "@/models/Villa";

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          error: "MongoDB connection string (MONGODB_URI) is not configured in environment variables.",
        },
        { status: 503 }
      );
    }

    await connectToDatabase();

    // Query active villas ordered by creation date descending
    const villas = await Villa.find({ status: "ACTIVE" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: villas.length,
        data: villas,
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
