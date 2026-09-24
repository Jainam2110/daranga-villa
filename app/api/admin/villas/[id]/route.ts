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
      googleMapsUrl,
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

    // Coordinate & Structured Location handling
    let updatedLat: number = villa.latitude ?? 24.5854;
    let updatedLng: number = villa.longitude ?? 73.7125;
    let updatedAddress: string =
      typeof villa.location === "object" && villa.location !== null
        ? (villa.location as { address?: string })?.address || ""
        : typeof villa.location === "string"
        ? villa.location
        : villa.zone || "";
    let updatedPlaceId: string =
      typeof villa.location === "object" && villa.location !== null
        ? (villa.location as { placeId?: string })?.placeId || villa.placeId || ""
        : villa.placeId || "";

    if (location !== undefined) {
      if (typeof location === "object" && location !== null) {
        if (location.latitude !== undefined && !isNaN(Number(location.latitude))) {
          updatedLat = Number(location.latitude);
        }
        if (location.longitude !== undefined && !isNaN(Number(location.longitude))) {
          updatedLng = Number(location.longitude);
        }
        if (location.address !== undefined) {
          updatedAddress = String(location.address).trim();
        }
        if (location.placeId !== undefined) {
          updatedPlaceId = String(location.placeId).trim();
        }
      } else if (typeof location === "string") {
        updatedAddress = location.trim();
      }
    }

    if (latitude !== undefined && !isNaN(Number(latitude))) {
      updatedLat = Number(latitude);
    }
    if (longitude !== undefined && !isNaN(Number(longitude))) {
      updatedLng = Number(longitude);
    }

    if (isNaN(updatedLat) || updatedLat < -90 || updatedLat > 90) {
      return NextResponse.json(
        { success: false, error: "Latitude must be a valid number between -90 and 90." },
        { status: 400 }
      );
    }

    if (isNaN(updatedLng) || updatedLng < -180 || updatedLng > 180) {
      return NextResponse.json(
        { success: false, error: "Longitude must be a valid number between -180 and 180." },
        { status: 400 }
      );
    }

    if (name) villa.name = name.trim();
    if (slug) villa.slug = slug.toLowerCase().trim();
    if (description !== undefined) villa.description = description;
    if (zone !== undefined) villa.zone = zone;

    villa.location = {
      address: updatedAddress || zone || "Udaipur, Rajasthan",
      latitude: updatedLat,
      longitude: updatedLng,
      placeId: updatedPlaceId,
    };
    villa.latitude = updatedLat;
    villa.longitude = updatedLng;
    villa.placeId = updatedPlaceId;

    if (googleMapsUrl !== undefined && String(googleMapsUrl).trim()) {
      villa.googleMapsUrl = String(googleMapsUrl).trim();
    } else {
      villa.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${updatedLat},${updatedLng}`;
    }

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

