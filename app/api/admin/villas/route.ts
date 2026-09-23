import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Villa from "@/models/Villa";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Fetch all villas for admin dashboard (both ACTIVE and INACTIVE)
    const villas = await Villa.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      { success: true, count: villas.length, data: villas },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      location,
      zone,
      latitude,
      longitude,
      mapX,
      mapY,
      images,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities,
      houseRules,
      cancellationPolicy,
      status,
    } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Villa name is required." },
        { status: 400 }
      );
    }

    if (
      pricePerNight === undefined ||
      pricePerNight === null ||
      isNaN(Number(pricePerNight)) ||
      Number(pricePerNight) < 0
    ) {
      return NextResponse.json(
        { success: false, error: "Price per night must be a valid non-negative number." },
        { status: 400 }
      );
    }

    if (
      maxGuests === undefined ||
      maxGuests === null ||
      isNaN(Number(maxGuests)) ||
      Number(maxGuests) < 1
    ) {
      return NextResponse.json(
        { success: false, error: "Maximum guests must be at least 1." },
        { status: 400 }
      );
    }

    // Auto slugify name if slug not provided
    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    await connectToDatabase();

    const existingVilla = await Villa.findOne({ slug: generatedSlug });
    if (existingVilla) {
      return NextResponse.json(
        { success: false, error: `Villa with slug '${generatedSlug}' already exists.` },
        { status: 409 }
      );
    }

    const newVilla = await Villa.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description || "",
      location: location || "",
      zone: zone || "Udaipur, Rajasthan",
      latitude: latitude !== undefined ? Number(latitude) : 24.5854,
      longitude: longitude !== undefined ? Number(longitude) : 73.7125,
      mapX: mapX !== undefined ? Number(mapX) : 50,
      mapY: mapY !== undefined ? Number(mapY) : 50,
      images: Array.isArray(images) ? images : [],
      pricePerNight: Number(pricePerNight),
      maxGuests: Number(maxGuests),
      bedrooms: bedrooms ? Number(bedrooms) : 1,
      bathrooms: bathrooms ? Number(bathrooms) : 1,
      amenities: Array.isArray(amenities) ? amenities : [],
      houseRules: Array.isArray(houseRules) ? houseRules : [],
      cancellationPolicy: cancellationPolicy || "",
      status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    });

    return NextResponse.json(
      { success: true, data: newVilla },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create villa";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
