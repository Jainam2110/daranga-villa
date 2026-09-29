import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let librariesPromise: Promise<{
  Map: typeof google.maps.Map;
  AdvancedMarkerElement?: typeof google.maps.marker.AdvancedMarkerElement;
  Marker?: typeof google.maps.Marker;
  Animation?: typeof google.maps.Animation;
  Autocomplete?: typeof google.maps.places.Autocomplete;
  Geocoder?: typeof google.maps.Geocoder;
} | null> | null = null;

/**
 * Returns the configured public Google Maps API Key.
 */
export function getGoogleMapsApiKey(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  }
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    ""
  );
}

/**
 * Singleton loader for Google Maps JavaScript API Libraries.
 * Returns constructors directly (Map, AdvancedMarkerElement, Marker, Autocomplete, Geocoder).
 */
export async function loadGoogleMapsLibraries() {
  if (typeof window === "undefined") {
    return null;
  }

  const key = getGoogleMapsApiKey();

  // Temporary safe log requested by audit checklist (No full key logged)
  console.log("[Google Maps Config Audit]", {
    keyPresent: Boolean(key && key.trim()),
    keyLength: key ? key.length : 0,
    first4Chars: key && key.length >= 4 ? key.substring(0, 4) : "N/A",
  });

  if (!key) {
    console.warn("Google Maps API key is not configured.");
    return null;
  }

  if (!librariesPromise) {
    librariesPromise = (async () => {
      setOptions({
        key,
        v: "weekly",
      });

      const [mapsLib, markerLib, placesLib, geocodingLib] = await Promise.all([
        importLibrary("maps") as Promise<google.maps.MapsLibrary>,
        importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
        importLibrary("places") as Promise<google.maps.PlacesLibrary>,
        importLibrary("geocoding") as Promise<google.maps.GeocodingLibrary>,
      ]);

      return {
        Map: mapsLib.Map,
        AdvancedMarkerElement: markerLib.AdvancedMarkerElement,
        Marker: markerLib.Marker,
        Animation: markerLib.Animation,
        Autocomplete: placesLib.Autocomplete,
        Geocoder: geocodingLib.Geocoder,
      };
    })();
  }

  try {
    return await librariesPromise;
  } catch (err) {
    console.error("Failed to load Google Maps JS API libraries:", err);
    librariesPromise = null;
    return null;
  }
}

/**
 * Legacy wrapper for compatibility.
 */
export async function loadGoogleMaps() {
  const libs = await loadGoogleMapsLibraries();
  if (!libs) return null;
  return window.google || null;
}

/**
 * Constructs a Google Maps Search URL based on exact coordinates.
 * Format: https://www.google.com/maps/search/?api=1&query=LATITUDE,LONGITUDE
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
 * Constructs a Google Maps Directions URL based on exact coordinates.
 * Format: https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE
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
 * Client-side reverse geocoding to convert lat/lng into a formatted address & placeId.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ address: string; placeId?: string } | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const libs = await loadGoogleMapsLibraries();
    if (!libs || !libs.Geocoder) {
      return null;
    }

    const geocoder = new libs.Geocoder();
    const response = await geocoder.geocode({ location: { lat, lng } });
    if (response.results && response.results.length > 0) {
      const topResult = response.results[0];
      return {
        address: topResult.formatted_address,
        placeId: topResult.place_id,
      };
    }
  } catch (error) {
    console.warn("Reverse geocoding failed:", error);
  }

  return null;
}
