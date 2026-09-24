import { VillaLocation } from "@/types/villa";

/**
 * Safely extracts a display address string from a location property,
 * supporting both string and structured VillaLocation objects.
 */
export function getVillaAddress(
  location?: unknown,
  fallback = "Udaipur, Rajasthan"
): string {
  if (!location) return fallback;
  if (typeof location === "string") return location.trim() || fallback;
  if (typeof location === "object" && location !== null) {
    const obj = location as { address?: string };
    if (typeof obj.address === "string" && obj.address.trim()) {
      return obj.address.trim();
    }
  }
  return fallback;
}

/**
 * Normalizes location input into a structured VillaLocation object.
 */
export function normalizeVillaLocation(
  rawLocation: unknown,
  rawLat?: unknown,
  rawLng?: unknown,
  rawPlaceId?: unknown
): VillaLocation {
  if (rawLocation && typeof rawLocation === "object") {
    const locObj = rawLocation as Record<string, unknown>;
    const lat =
      typeof locObj.latitude === "number"
        ? locObj.latitude
        : typeof rawLat === "number"
        ? rawLat
        : 24.5854;
    const lng =
      typeof locObj.longitude === "number"
        ? locObj.longitude
        : typeof rawLng === "number"
        ? rawLng
        : 73.7125;
    return {
      address: typeof locObj.address === "string" ? locObj.address : "",
      latitude: lat,
      longitude: lng,
      placeId:
        typeof locObj.placeId === "string"
          ? locObj.placeId
          : typeof rawPlaceId === "string"
          ? rawPlaceId
          : "",
    };
  }

  const address = typeof rawLocation === "string" ? rawLocation : "";
  const lat = typeof rawLat === "number" ? rawLat : 24.5854;
  const lng = typeof rawLng === "number" ? rawLng : 73.7125;

  return {
    address,
    latitude: lat,
    longitude: lng,
    placeId: typeof rawPlaceId === "string" ? rawPlaceId : "",
  };
}
