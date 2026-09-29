import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import VillaModel, { IVilla } from "@/models/Villa";
import { Villa } from "@/types/villa";
import { DEFAULT_VILLA_IMAGE } from "@/lib/constants";
import { normalizeVillaImage, getPrimaryVillaImageUrl } from "@/lib/utils/image";
import { normalizeVillaLocation, getVillaAddress, isValidCoordinates } from "@/lib/utils/villa-location";

export { normalizeVillaImage, getPrimaryVillaImageUrl, normalizeVillaLocation, getVillaAddress };

/**
 * Serialize a raw Mongoose Villa document to a clean client-safe Villa type.
 */
export function serializeVilla(doc: IVilla): Villa {
  const images =
    doc.images && doc.images.length > 0
      ? doc.images.map(normalizeVillaImage)
      : [{ url: DEFAULT_VILLA_IMAGE, publicId: "" }];

  const structuredLoc = normalizeVillaLocation(
    doc.location,
    doc.latitude,
    doc.longitude,
    doc.placeId
  );

  const coordCheck = isValidCoordinates(structuredLoc.latitude, structuredLoc.longitude);
  const lat = coordCheck.valid ? coordCheck.lat : undefined;
  const lng = coordCheck.valid ? coordCheck.lng : undefined;

  const addressText =
    structuredLoc.address ||
    (typeof doc.location === "string" ? doc.location : "") ||
    doc.zone ||
    "";

  const googleMapsUrl =
    doc.googleMapsUrl && doc.googleMapsUrl.trim()
      ? doc.googleMapsUrl.trim()
      : coordCheck.valid
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : "";

  return {
    id: doc._id.toString(),
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    tagline: doc.description ? doc.description.slice(0, 100) + "..." : "Exclusive Villa Residence",
    description: doc.description || "",
    location: coordCheck.valid
      ? {
          address: addressText,
          latitude: lat!,
          longitude: lng!,
          placeId: structuredLoc.placeId || doc.placeId || "",
        }
      : addressText,
    zone: doc.zone || addressText || "",
    googleMapsUrl,
    latitude: lat,
    longitude: lng,
    placeId: structuredLoc.placeId || doc.placeId || "",
    mapX: doc.mapX !== undefined ? doc.mapX : 50,
    mapY: doc.mapY !== undefined ? doc.mapY : 50,
    images,
    pricePerNight: doc.pricePerNight,
    maxGuests: doc.maxGuests,
    bedrooms: doc.bedrooms || 1,
    bathrooms: doc.bathrooms || 1,
    amenities: doc.amenities || [],
    houseRules: doc.houseRules || [],
    cancellationPolicy: doc.cancellationPolicy || "Flexible cancellation up to 7 days prior to check-in.",
    status: doc.status,
    rating: 4.95,
    reviewsCount: 18,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  };
}

/**
 * Server-side helper to fetch all ACTIVE villas from MongoDB.
 */
export async function getActiveVillas(): Promise<Villa[]> {
  try {
    await connectToDatabase();
    const rawVillas = await VillaModel.find({ status: "ACTIVE" })
      .sort({ createdAt: -1 })
      .lean<IVilla[]>();

    return rawVillas.map(serializeVilla);
  } catch (error) {
    console.error("Failed to fetch active villas from MongoDB:", error);
    return [];
  }
}

/**
 * Server-side helper to fetch a single ACTIVE villa by its unique slug or ObjectId.
 */
export async function getVillaBySlug(slug: string): Promise<Villa | null> {
  try {
    if (!slug) return null;
    await connectToDatabase();

    const cleanRaw = slug.trim();
    const decoded = decodeURIComponent(cleanRaw).toLowerCase().trim();
    const normalized = decoded
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const possibleSlugs = Array.from(
      new Set([cleanRaw.toLowerCase(), decoded, normalized].filter(Boolean))
    );

    const orConditions: Record<string, unknown>[] = possibleSlugs.map((s) => ({ slug: s }));

    if (mongoose.Types.ObjectId.isValid(cleanRaw)) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(cleanRaw) });
    }

    const rawVilla = await VillaModel.findOne({
      status: "ACTIVE",
      $or: orConditions,
    }).lean<IVilla>();

    if (!rawVilla) {
      return null;
    }

    return serializeVilla(rawVilla);
  } catch (error) {
    console.error(`Failed to fetch villa by slug '${slug}':`, error);
    return null;
  }
}
