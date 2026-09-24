import { DEFAULT_VILLA_IMAGE } from "@/lib/constants";
import { VillaImageCategory, VillaImageObject } from "@/types/villa";

const VALID_CATEGORIES: Set<VillaImageCategory> = new Set([
  "EXTERIOR",
  "LIVING_ROOM",
  "BEDROOM",
  "BATHROOM",
  "KITCHEN",
  "POOL",
  "DINING",
  "GARDEN",
  "BALCONY",
  "VIEW",
  "AMENITIES",
  "OTHER",
]);

/**
 * Clean & validate image category. Defaults to "OTHER" if missing or unrecognized.
 */
export function sanitizeImageCategory(category: unknown): VillaImageCategory {
  if (typeof category === "string") {
    const upper = category.toUpperCase().trim().replace(/[\s-]+/g, "_") as VillaImageCategory;
    if (VALID_CATEGORIES.has(upper)) {
      return upper;
    }
  }
  return "OTHER";
}

/**
 * Format category enum to human readable label (e.g. "LIVING_ROOM" -> "Living Room").
 */
export function formatCategoryLabel(category: VillaImageCategory): string {
  switch (category) {
    case "EXTERIOR":
      return "Exterior";
    case "LIVING_ROOM":
      return "Living Room";
    case "BEDROOM":
      return "Bedroom";
    case "BATHROOM":
      return "Bathroom";
    case "KITCHEN":
      return "Kitchen";
    case "POOL":
      return "Pool";
    case "DINING":
      return "Dining";
    case "GARDEN":
      return "Garden";
    case "BALCONY":
      return "Balcony";
    case "VIEW":
      return "View";
    case "AMENITIES":
      return "Amenities";
    case "OTHER":
    default:
      return "Other";
  }
}

/**
 * Normalize an image entry (either a string URL or { url, publicId, category?, label? } object)
 * to a standardized VillaImageObject.
 */
export function normalizeVillaImage(img: unknown): VillaImageObject {
  if (!img) {
    return { url: "", publicId: "", category: "OTHER", label: "" };
  }
  if (typeof img === "string") {
    return {
      url: img.trim(),
      publicId: "",
      category: "OTHER",
      label: "",
    };
  }
  if (typeof img === "object" && img !== null && "url" in img) {
    const obj = img as {
      url?: string;
      publicId?: string;
      category?: string;
      label?: string;
    };
    const category = sanitizeImageCategory(obj.category);
    return {
      url: (obj.url || "").trim(),
      publicId: (obj.publicId || "").trim(),
      category,
      label: (obj.label || "").trim(),
    };
  }
  return { url: "", publicId: "", category: "OTHER", label: "" };
}

/**
 * Get primary cover image URL for a villa with default fallback.
 */
export function getPrimaryVillaImageUrl(images?: unknown[]): string {
  if (!images || images.length === 0) {
    return DEFAULT_VILLA_IMAGE;
  }
  const primary = normalizeVillaImage(images[0]);
  return primary.url || DEFAULT_VILLA_IMAGE;
}

/**
 * Get all normalized image URLs for a villa with fallback.
 */
export function getAllVillaImageUrls(images?: unknown[], fallbackUrl?: string): string[] {
  if (!images || images.length === 0) {
    return [fallbackUrl || DEFAULT_VILLA_IMAGE];
  }
  const urls = images
    .map((img) => normalizeVillaImage(img).url)
    .filter((url) => typeof url === "string" && url.trim().length > 0);

  return urls.length > 0 ? urls : [fallbackUrl || DEFAULT_VILLA_IMAGE];
}

/**
 * Get full array of normalized VillaImageObject items with metadata.
 */
export function getVillaImagesWithMetadata(
  images?: unknown[],
  fallbackUrl?: string
): VillaImageObject[] {
  if (!images || images.length === 0) {
    return [
      {
        url: fallbackUrl || DEFAULT_VILLA_IMAGE,
        publicId: "",
        category: "EXTERIOR",
        label: "Exterior Sanctuary View",
      },
    ];
  }

  const normalized = images
    .map(normalizeVillaImage)
    .filter((img) => typeof img.url === "string" && img.url.trim().length > 0);

  if (normalized.length === 0) {
    return [
      {
        url: fallbackUrl || DEFAULT_VILLA_IMAGE,
        publicId: "",
        category: "EXTERIOR",
        label: "Exterior Sanctuary View",
      },
    ];
  }

  return normalized;
}


