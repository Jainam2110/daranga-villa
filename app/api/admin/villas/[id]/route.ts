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

    // Process Location updates
    if (location !== undefined || latitude !== undefined || longitude !== undefined) {
      let placeAddress = "";
      let parsedLat: number = NaN;
      let parsedLng: number = NaN;
      let placeId = "";

      if (typeof location === "object" && location !== null) {
        placeAddress = typeof location.address === "string" ? location.address.trim() : "";
        parsedLat = Number(location.latitude);
        parsedLng = Number(location.longitude);
        placeId = typeof location.placeId === "string" ? location.placeId.trim() : "";
      } else if (typeof location === "string") {
        placeAddress = location.trim();
      }

      if (isNaN(parsedLat) && latitude !== undefined) {
        parsedLat = Number(latitude);
      }
      if (isNaN(parsedLng) && longitude !== undefined) {
        parsedLng = Number(longitude);
      }

      // If location is being updated with coordinates, validate them
      if (!isNaN(parsedLat) || !isNaN(parsedLng) || (typeof location === "object" && location !== null)) {
        if (
          isNaN(parsedLat) ||
          isNaN(parsedLng) ||
          parsedLat < -90 ||
          parsedLat > 90 ||
          parsedLng < -180 ||
          parsedLng > 180
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Latitude must be a valid number between -90 and 90, and Longitude between -180 and 180.",
            },
            { status: 400 }
          );
        }

        if (!placeAddress) {
          return NextResponse.json(
            { success: false, error: "Villa address is required when updating location." },
            { status: 400 }
          );
        }

        villa.location = {
          address: placeAddress,
          latitude: parsedLat,
          longitude: parsedLng,
          placeId,
        };
        villa.latitude = parsedLat;
        villa.longitude = parsedLng;
        villa.placeId = placeId;

        if (googleMapsUrl !== undefined && String(googleMapsUrl).trim()) {
          villa.googleMapsUrl = String(googleMapsUrl).trim();
        } else {
          villa.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`;
        }
      } else if (typeof location === "string" && location.trim()) {
        // Plain string location fallback for old compatibility
        villa.location = location.trim();
      }
    }

    if (name) villa.name = name.trim();

    if (slug !== undefined) {
      const candidateSlug = (typeof slug === "string" && slug.trim() ? slug : name || villa.name)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (candidateSlug && candidateSlug !== villa.slug) {
        const existingVilla = await Villa.findOne({
          slug: candidateSlug,
          _id: { $ne: villa._id },
        });
        if (existingVilla) {
          return NextResponse.json(
            { success: false, error: `Villa with slug '${candidateSlug}' already exists.` },
            { status: 409 }
          );
        }
        villa.slug = candidateSlug;
      }
    }

    if (description !== undefined) villa.description = description;
    if (zone !== undefined) villa.zone = zone;
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
