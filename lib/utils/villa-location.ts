import { VillaLocation } from "@/types/villa";

/**
 * Safely extracts a display address string from a location property,
 * supporting both string and structured VillaLocation objects.
 */
export function getVillaAddress(
  location?: unknown,
  fallback = "Location not specified"
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
 * Helper to check if latitude and longitude are valid numbers.
 */
export function isValidCoordinates(
  lat: unknown,
  lng: unknown
): { valid: true; lat: number; lng: number } | { valid: false; lat: undefined; lng: undefined } {
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (
    typeof lat !== "undefined" &&
    lat !== null &&
    !isNaN(numLat) &&
    numLat >= -90 &&
    numLat <= 90 &&
    typeof lng !== "undefined" &&
    lng !== null &&
    !isNaN(numLng) &&
    numLng >= -180 &&
    numLng <= 180 &&
    !(numLat === 0 && numLng === 0)
  ) {
    return { valid: true, lat: numLat, lng: numLng };
  }

  return { valid: false, lat: undefined, lng: undefined };
}

/**
 * Normalizes location input into a structured VillaLocation object or partial object.
 * Does NOT fabricate default/fake coordinates if missing or invalid.
 */
export function normalizeVillaLocation(
  rawLocation: unknown,
  rawLat?: unknown,
  rawLng?: unknown,
  rawPlaceId?: unknown
): VillaLocation | { address: string; latitude?: number; longitude?: number; placeId?: string } {
  let address = "";
  let placeId = typeof rawPlaceId === "string" ? rawPlaceId.trim() : "";
  let targetLat = rawLat;
  let targetLng = rawLng;

  if (rawLocation && typeof rawLocation === "object") {
    const locObj = rawLocation as Record<string, unknown>;
    if (typeof locObj.address === "string") {
      address = locObj.address.trim();
    }
    if (typeof locObj.placeId === "string" && locObj.placeId.trim()) {
      placeId = locObj.placeId.trim();
    }
    if (locObj.latitude !== undefined) {
      targetLat = locObj.latitude;
    }
    if (locObj.longitude !== undefined) {
      targetLng = locObj.longitude;
    }
  } else if (typeof rawLocation === "string") {
    address = rawLocation.trim();
  }

  const coordCheck = isValidCoordinates(targetLat, targetLng);

  if (coordCheck.valid) {
    return {
      address,
      latitude: coordCheck.lat,
      longitude: coordCheck.lng,
      placeId,
    };
  }

  return {
    address,
    latitude: undefined,
    longitude: undefined,
    placeId,
  };
}
