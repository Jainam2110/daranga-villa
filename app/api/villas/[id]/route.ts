import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Villa from "@/models/Villa";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          error: "MongoDB connection string (MONGODB_URI) is not configured in environment variables.",
        },
        { status: 503 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Villa ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query active villa either by ObjectId or by unique slug
    const cleanId = decodeURIComponent(id || "").trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);
    const normalizedSlug = cleanId
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const query = isObjectId
      ? { _id: cleanId, status: "ACTIVE" as const }
      : {
          status: "ACTIVE" as const,
          $or: [
            { slug: cleanId.toLowerCase() },
            { slug: normalizedSlug },
          ],
        };

    const villa = await Villa.findOne(query).lean();

    if (!villa) {
      return NextResponse.json(
        {
          success: false,
          error: `Villa with identifier '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: villa,
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
