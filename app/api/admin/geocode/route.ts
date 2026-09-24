import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "";

    // 1. REVERSE GEOCODING (lat + lng -> address)
    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json(
          { success: false, error: "Invalid coordinates provided." },
          { status: 400 }
        );
      }

      // If Google Maps API key available, query Google Geocoding API
      if (apiKey) {
        try {
          const googleRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
          );
          if (googleRes.ok) {
            const googleData = await googleRes.json();
            if (googleData.status === "OK" && googleData.results?.length > 0) {
              const primary = googleData.results[0];
              return NextResponse.json({
                success: true,
                address: primary.formatted_address,
                placeId: primary.place_id,
                latitude: lat,
                longitude: lng,
              });
            }
          }
        } catch (e) {
          console.warn("Google reverse geocoding error:", e);
        }
      }

      // Fallback: OpenStreetMap Nominatim reverse geocode
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "DarangaVillaAdmin/1.0 (contact@darangavilla.com)",
            },
          }
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (nomData && nomData.display_name) {
            return NextResponse.json({
              success: true,
              address: nomData.display_name,
              placeId: String(nomData.place_id || ""),
              latitude: lat,
              longitude: lng,
            });
          }
        }
      } catch (e) {
        console.warn("Nominatim reverse geocode error:", e);
      }

      return NextResponse.json({
        success: true,
        address: `Udaipur, Rajasthan (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        latitude: lat,
        longitude: lng,
      });
    }

    // 2. TEXT FORWARD SEARCH (q -> search results)
    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    // If Google Maps API key available, query Google Places / Geocode API
    if (apiKey) {
      try {
        const googleRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            query.toLowerCase().includes("india") ? query : `${query}, Udaipur, Rajasthan, India`
          )}&key=${apiKey}`
        );
        if (googleRes.ok) {
          const googleData = await googleRes.json();
          if (googleData.status === "OK" && Array.isArray(googleData.results)) {
            interface GoogleGeocodeResult {
              formatted_address: string;
              place_id: string;
              geometry?: {
                location?: {
                  lat: number;
                  lng: number;
                };
              };
            }
            const results = (googleData.results as GoogleGeocodeResult[]).map((item) => ({
              name: item.formatted_address.split(",")[0],
              displayName: item.formatted_address,
              latitude: item.geometry?.location?.lat ?? 24.5854,
              longitude: item.geometry?.location?.lng ?? 73.7125,
              placeId: item.place_id,
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${item.geometry?.location?.lat},${item.geometry?.location?.lng}`,
            }));
            if (results.length > 0) {
              return NextResponse.json({ success: true, results });
            }
          }
        }
      } catch (e) {
        console.warn("Google forward geocoding error:", e);
      }
    }

    // Fallback: Nominatim Geocoding API
    const targetQuery =
      query.toLowerCase().includes("rajasthan") || query.toLowerCase().includes("udaipur")
        ? query
        : `${query}, Udaipur, Rajasthan, India`;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        targetQuery
      )}&limit=6&addressdetails=1`,
      {
        headers: {
          "User-Agent": "DarangaVillaAdmin/1.0 (contact@darangavilla.com)",
        },
      }
    );

    let data = [];
    if (res.ok) {
      data = await res.json();
    }

    if ((!data || data.length === 0) && query !== targetQuery) {
      const fallbackRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=6&addressdetails=1`,
        {
          headers: {
            "User-Agent": "DarangaVillaAdmin/1.0 (contact@darangavilla.com)",
          },
        }
      );
      if (fallbackRes.ok) {
        data = await fallbackRes.json();
      }
    }

    interface NominatimItem {
      place_id?: number | string;
      name?: string;
      display_name: string;
      lat: string;
      lon: string;
    }

    const results = ((data as NominatimItem[]) || []).map((item: NominatimItem) => ({
      name: item.name || item.display_name.split(",")[0],
      displayName: item.display_name,
      placeId: String(item.place_id || ""),
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`,
    }));

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Geocoding failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
