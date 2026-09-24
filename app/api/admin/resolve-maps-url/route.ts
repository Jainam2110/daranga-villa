import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const rawInput = (body.url || body.input || "").trim();

    if (!rawInput) {
      return NextResponse.json(
        { success: false, error: "URL or coordinates input is required." },
        { status: 400 }
      );
    }

    // 1. Check if raw coordinates like "24.5854, 73.6780" or "24.5854,73.6780" were passed
    const rawCoordMatch = rawInput.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
    if (rawCoordMatch && rawCoordMatch[1] && rawCoordMatch[2]) {
      const lat = parseFloat(rawCoordMatch[1]);
      const lng = parseFloat(rawCoordMatch[2]);
      return NextResponse.json({
        success: true,
        latitude: lat,
        longitude: lng,
        resolvedUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      });
    }

    // 2. Extract src if user pasted an iframe HTML tag
    let targetUrl = rawInput;
    const iframeSrcMatch = rawInput.match(/src=["']([^"']+)["']/);
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      targetUrl = iframeSrcMatch[1];
    }

    // 3. If targetUrl already contains coordinates, extract directly
    let lat: number | null = null;
    let lng: number | null = null;

    const extractCoordinates = (str: string) => {
      // Format 1: @24.5854,73.6780
      const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch && atMatch[1] && atMatch[2]) {
        return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
      }

      // Format 2: !3d24.5854!4d73.6780 (Protobuf format commonly in Google Maps URLs)
      const protoMatch = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (protoMatch && protoMatch[1] && protoMatch[2]) {
        return { lat: parseFloat(protoMatch[1]), lng: parseFloat(protoMatch[2]) };
      }

      // Format 3: ?q=24.5854,73.6780 or &query=24.5854,73.6780 or &ll=24.5854,73.6780
      const qMatch = str.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch && qMatch[1] && qMatch[2]) {
        return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
      }

      // Format 4: pb=...!2d73.6780!3d24.5854 (Embed format: 2d is lng, 3d is lat)
      const embedMatch = str.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
      if (embedMatch && embedMatch[1] && embedMatch[2]) {
        return { lat: parseFloat(embedMatch[2]), lng: parseFloat(embedMatch[1]) };
      }

      return null;
    };

    const directCoords = extractCoordinates(targetUrl);
    if (directCoords) {
      lat = directCoords.lat;
      lng = directCoords.lng;
    }

    // 4. If no coordinates found in URL (e.g. short link https://maps.app.goo.gl/... or https://goo.gl/maps/...)
    // Follow redirect to resolve the final destination URL
    let resolvedUrl = targetUrl;
    if (lat === null || lng === null) {
      if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
        try {
          const response = await fetch(targetUrl, {
            method: "GET",
            redirect: "follow",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });

          resolvedUrl = response.url || targetUrl;
          const redirectCoords = extractCoordinates(resolvedUrl);
          if (redirectCoords) {
            lat = redirectCoords.lat;
            lng = redirectCoords.lng;
          } else {
            // Also check response HTML text in case coordinates are in meta tags or script
            const html = await response.text();
            const htmlCoords = extractCoordinates(html);
            if (htmlCoords) {
              lat = htmlCoords.lat;
              lng = htmlCoords.lng;
            }
          }
        } catch {
          // If fetch fails, keep original url
        }
      }
    }

    if (lat !== null && lng !== null) {
      return NextResponse.json({
        success: true,
        latitude: lat,
        longitude: lng,
        resolvedUrl: rawInput,
      });
    }

    return NextResponse.json({
      success: true,
      latitude: null,
      longitude: null,
      resolvedUrl: rawInput,
      message: "Saved URL. Coordinates could not be automatically extracted; you can drag the pin on the map to set exact coordinates.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Resolution failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
