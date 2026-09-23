import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudinary credentials are not configured in server environment variables (.env.local).",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const villaId = formData.get("villaId") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided in request." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type '${file.type}'. Allowed formats: JPG, PNG, WEBP, AVIF, GIF.`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 10MB limit (File size: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB).`,
        },
        { status: 400 }
      );
    }

    // Convert file arrayBuffer to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Target folder in Cloudinary
    const folderPath = villaId
      ? `daranga-villa/villas/${villaId.trim()}`
      : "daranga-villa/villas";

    // Upload to Cloudinary using upload_stream
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload returned empty result"));
            } else {
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              });
            }
          }
        );
        uploadStream.end(buffer);
      }
    );

    return NextResponse.json(
      {
        success: true,
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    let message = "Cloudinary image upload failed";
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
