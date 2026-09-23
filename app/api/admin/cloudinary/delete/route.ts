import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/mongodb";
import Villa from "@/models/Villa";

export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { publicId, villaId, url } = body;

    if (!publicId && !url) {
      return NextResponse.json(
        { success: false, error: "Public ID or Image URL is required for deletion." },
        { status: 400 }
      );
    }

    // 1. Delete image from Cloudinary if publicId is available
    if (
      publicId &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error(`Failed to destroy Cloudinary image ${publicId}:`, cloudErr);
      }
    }

    // 2. Remove image from Villa document in database if villaId is provided
    if (villaId && mongoose.Types.ObjectId.isValid(villaId)) {
      await connectToDatabase();
      const villa = await Villa.findById(villaId);
      if (villa) {
        villa.images = villa.images.filter((img) => {
          if (typeof img === "string") {
            return img !== url && img !== publicId;
          }
          if (img && typeof img === "object" && "publicId" in img) {
            const obj = img as { publicId?: string; url?: string };
            if (publicId && obj.publicId === publicId) return false;
            if (url && obj.url === url) return false;
          }
          return true;
        });
        await villa.save();
      }
    }

    return NextResponse.json(
      { success: true, message: "Image removed successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    let message = "Cloudinary image deletion failed";
    if (typeof error === "string") {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (error && typeof error === "object" && "message" in error) {
      message = String((error as { message: unknown }).message);
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
