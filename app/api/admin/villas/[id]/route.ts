import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Villa from "@/models/Villa";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function PUT(
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

    await connectToDatabase();

    const villa = await Villa.findById(id);
    if (!villa) {
      return NextResponse.json(
        { success: false, error: "Villa not found." },
        { status: 404 }
      );
    }

    if (name) villa.name = name.trim();
    if (slug) villa.slug = slug.toLowerCase().trim();
    if (description !== undefined) villa.description = description;
    if (location !== undefined) villa.location = location;
    if (zone !== undefined) villa.zone = zone;
    if (latitude !== undefined) villa.latitude = Number(latitude);
    if (longitude !== undefined) villa.longitude = Number(longitude);
    if (mapX !== undefined) villa.mapX = Number(mapX);
    if (mapY !== undefined) villa.mapY = Number(mapY);
    if (Array.isArray(images)) villa.images = images;
    if (pricePerNight !== undefined) villa.pricePerNight = Number(pricePerNight);
    if (maxGuests !== undefined) villa.maxGuests = Number(maxGuests);
    if (bedrooms !== undefined) villa.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) villa.bathrooms = Number(bathrooms);
    if (Array.isArray(amenities)) villa.amenities = amenities;
    if (Array.isArray(houseRules)) villa.houseRules = houseRules;
    if (cancellationPolicy !== undefined) villa.cancellationPolicy = cancellationPolicy;
    if (status && ["ACTIVE", "INACTIVE"].includes(status)) villa.status = status;

    await villa.save();

    return NextResponse.json(
      { success: true, data: villa },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await connectToDatabase();

    const deletedVilla = await Villa.findByIdAndDelete(id);
    if (!deletedVilla) {
      return NextResponse.json(
        { success: false, error: "Villa not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Villa deleted successfully.",
        deletedId: id,
      },
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

