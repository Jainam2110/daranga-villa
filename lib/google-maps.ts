import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let googleMapsPromise: Promise<typeof google> | null = null;

export function getGoogleMapsApiKey(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  }
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
}

/**
 * Singleton Google Maps API Script Loader.
 * Safely loads Google Maps JS API with Places, Marker & Geometry libraries.
 */
export async function loadGoogleMaps(apiKey?: string): Promise<typeof google | null> {
  if (typeof window === "undefined") {
    return null;
  }

  // Already loaded globally on window
  if (window.google && window.google.maps) {
    return window.google;
  }

  const key = apiKey || getGoogleMapsApiKey();
  if (!key) {
    // API Key not configured
    return null;
  }

  if (!googleMapsPromise) {
    googleMapsPromise = (async () => {
      setOptions({
        key: key,
        v: "weekly",
      });

      await Promise.all([
        importLibrary("maps"),
        importLibrary("places"),
        importLibrary("marker"),
        importLibrary("geometry"),
      ]);

      return window.google;
    })();
  }

  try {
    return await googleMapsPromise;
  } catch (err) {
    console.warn("Google Maps JS API failed to load via Loader:", err);
    googleMapsPromise = null;
    return null;
  }
}

/**
 * Universal canonical Google Maps Search URL based on exact coordinates.
 */
export function buildGoogleMapsSearchUrl(lat: number, lng: number): string {
  const safeLat = Number(lat);
  const safeLng = Number(lng);
  if (isNaN(safeLat) || isNaN(safeLng)) {
    return "https://www.google.com/maps";
  }
  return `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`;
}

/**
 * Universal canonical Google Maps Directions URL based on exact coordinates.
 */
export function buildGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  const safeLat = Number(lat);
  const safeLng = Number(lng);
  if (isNaN(safeLat) || isNaN(safeLng)) {
    return "https://www.google.com/maps";
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${safeLat},${safeLng}`;
}

/**
 * Universal Google Maps Embed URL for responsive iframes.
 */
export function buildGoogleMapsEmbedUrl(
  lat: number,
  lng: number,
  zoom = 16,
  mapMode: "street" | "satellite" | "terrain" = "street"
): string {
  const safeLat = Number(lat);
  const safeLng = Number(lng);
  const tCode = mapMode === "satellite" ? "k" : mapMode === "terrain" ? "p" : "m";

  if (isNaN(safeLat) || isNaN(safeLng)) {
    return `https://maps.google.com/maps?q=24.5854,73.7125&hl=en&z=${zoom}&t=${tCode}&output=embed`;
  }
  return `https://maps.google.com/maps?q=${safeLat},${safeLng}&hl=en&z=${zoom}&t=${tCode}&output=embed`;
}

/**
 * Reverse geocode coordinates to a human-readable formatted address.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ address: string; placeId?: string } | null> {
  if (typeof window !== "undefined" && window.google && window.google.maps) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results.length > 0) {
        return {
          address: response.results[0].formatted_address,
          placeId: response.results[0].place_id,
        };
      }
    } catch {
      // Fallback to server geocoder
    }
  }

  // Fallback to server-side endpoint if available
  try {
    const res = await fetch(`/api/admin/geocode?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.address) {
        return {
          address: data.address,
          placeId: data.placeId || "",
        };
      }
    }
  } catch {
    // Ignore fallback failure
  }

  return null;
}
