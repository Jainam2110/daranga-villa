import { DEFAULT_VILLA_IMAGE } from "@/lib/constants";

/**
 * Normalize an image entry (either a string URL or { url, publicId } object) to { url, publicId }.
 */
export function normalizeVillaImage(img: unknown): { url: string; publicId: string } {
  if (!img) return { url: "", publicId: "" };
  if (typeof img === "string") {
    return { url: img.trim(), publicId: "" };
  }
  if (typeof img === "object" && img !== null && "url" in img) {
    const obj = img as { url: string; publicId?: string };
    return { url: (obj.url || "").trim(), publicId: (obj.publicId || "").trim() };
  }
  return { url: "", publicId: "" };
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

