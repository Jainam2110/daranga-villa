"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";
import { loadGoogleMapsLibraries } from "@/lib/google-maps";

export interface VillaLocationMapProps {
  latitude: number;
  longitude: number;
  address: string;
  villaName: string;
}

type MapMarkerInstance = {
  setMap?: (map: google.maps.Map | null) => void;
  setPosition?: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  map?: google.maps.Map | null;
  position?: google.maps.LatLng | google.maps.LatLngLiteral | null;
} | null;

export function VillaLocationMap({
  latitude,
  longitude,
  address,
  villaName,
}: VillaLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<MapMarkerInstance>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const safeLat = Number(latitude);
  const safeLng = Number(longitude);
  const isValidCoords =
    !isNaN(safeLat) &&
    !isNaN(safeLng) &&
    safeLat >= -90 &&
    safeLat <= 90 &&
    safeLng >= -180 &&
    safeLng <= 180 &&
    !(safeLat === 0 && safeLng === 0);

  useEffect(() => {
    let isMounted = true;

    async function initCustomerMap() {
      if (!mapContainerRef.current || !isValidCoords) return;

      const libs = await loadGoogleMapsLibraries();
      if (!libs || !isMounted || !mapContainerRef.current) {
        if (isMounted) {
          setMapError("Google Map could not be loaded.");
        }
        return;
      }

      setIsMapLoaded(true);
      setMapError(null);

      const center = { lat: safeLat, lng: safeLng };

      const map = new libs.Map(mapContainerRef.current, {
        center,
        zoom: 15,
        mapId: "DEMO_MAP_ID",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: "cooperative", // Allows smooth mobile page scrolling
      });

      mapInstanceRef.current = map;

      // Add read-only marker at exact coordinates
      let marker: MapMarkerInstance = null;

      if (libs.AdvancedMarkerElement) {
        try {
          marker = new libs.AdvancedMarkerElement({
            map,
            position: center,
            gmpDraggable: false, // Read-only: customer cannot move marker
            title: villaName || "Villa Location",
          });
        } catch (e) {
          console.warn("AdvancedMarkerElement init failed on customer map, falling back:", e);
        }
      }

      if (!marker && libs.Marker) {
        marker = new libs.Marker({
          position: center,
          map,
          draggable: false, // Read-only
          title: villaName || "Villa Location",
          animation: libs.Animation?.DROP,
        });
      }

      markerInstanceRef.current = marker;
    }

    initCustomerMap();

    return () => {
      isMounted = false;
      if (markerInstanceRef.current) {
        if ("setMap" in markerInstanceRef.current && typeof markerInstanceRef.current.setMap === "function") {
          markerInstanceRef.current.setMap(null);
        } else {
          markerInstanceRef.current.map = null;
        }
        markerInstanceRef.current = null;
      }
    };
  }, [isValidCoords, safeLat, safeLng, villaName]);

  if (!isValidCoords) {
    return (
      <div className="w-full p-6 text-center rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] space-y-2">
        <MapPin className="w-6 h-6 mx-auto text-[#EFA1AA]" />
        <h4 className="font-serif text-base font-semibold text-[#202020] dark:text-[#FCFBF8]">
          Exact Location Not Configured
        </h4>
        <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">
          {address || "Please contact our concierge team for exact location details."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E8E8] dark:border-[#383633] bg-[#171717] shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

      {/* Loading state */}
      {!isMapLoaded && !mapError && (
        <div className="absolute inset-0 z-20 bg-[#171717]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#EFA1AA]" />
          <span>Loading Map Location...</span>
        </div>
      )}

      {/* Fallback error overlay */}
      {mapError && (
        <div className="absolute inset-0 z-20 bg-stone-900/90 p-6 flex flex-col items-center justify-center text-center gap-2 text-white">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
          <p className="text-xs text-stone-300 font-medium">{mapError}</p>
          <p className="text-[11px] text-stone-400 max-w-sm">{address}</p>
        </div>
      )}
    </div>
  );
}
