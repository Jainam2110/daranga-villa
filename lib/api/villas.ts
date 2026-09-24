import { connectToDatabase } from "@/lib/mongodb";
import VillaModel, { IVilla } from "@/models/Villa";
import { Villa } from "@/types/villa";

/**
 * Fallback image placeholder when a villa has no uploaded images.
 */
import { DEFAULT_VILLA_IMAGE } from "@/lib/constants";

import { normalizeVillaImage, getPrimaryVillaImageUrl } from "@/lib/utils/image";
import { normalizeVillaLocation, getVillaAddress } from "@/lib/utils/villa-location";

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

  const lat = structuredLoc.latitude;
  const lng = structuredLoc.longitude;
  const addressText =
    structuredLoc.address ||
    (typeof doc.location === "string" ? doc.location : "") ||
    doc.zone ||
    "Daranga Estate, Udaipur";

  return {
    id: doc._id.toString(),
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    tagline: doc.description ? doc.description.slice(0, 100) + "..." : "Exclusive Villa Residence",
    description: doc.description || "",
    location: structuredLoc,
    zone: doc.zone || addressText || "Udaipur, Rajasthan",
    googleMapsUrl:
      doc.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
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
 * Server-side helper to fetch a single ACTIVE villa by its unique slug.
 */
export async function getVillaBySlug(slug: string): Promise<Villa | null> {
  try {
    await connectToDatabase();
    const rawVilla = await VillaModel.findOne({
      slug: slug.toLowerCase().trim(),
      status: "ACTIVE",
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
