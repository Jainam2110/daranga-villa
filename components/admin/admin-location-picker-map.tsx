"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, TileLayer } from "leaflet";
import { Layers, Sparkles, MapPin } from "lucide-react";

interface AdminLocationPickerMapProps {
  latitude: number;
  longitude: number;
  villaName: string;
  onChangeCoordinates: (lat: number, lng: number) => void;
}

export function AdminLocationPickerMap({
  latitude,
  longitude,
  villaName,
  onChangeCoordinates,
}: AdminLocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const onChangeCoordinatesRef = useRef(onChangeCoordinates);
  useEffect(() => {
    onChangeCoordinatesRef.current = onChangeCoordinates;
  }, [onChangeCoordinates]);

  const [isSatellite, setIsSatellite] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      const initialLat = latitude || 24.5854;
      const initialLng = longitude || 73.6780;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
      });

      // Free OpenStreetMap Tile Layer (Zero API Key needed)
      const streetUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const tileLayer = L.tileLayer(streetUrl, {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Custom Gold Pin Marker
      const customIcon = L.divIcon({
        className: "custom-gold-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing" style="transform: translate(-50%, -50%);">
            <div class="absolute -inset-3 rounded-full bg-[#C89B4A]/40 animate-ping"></div>
            <div class="w-8 h-8 rounded-full bg-[#C89B4A] text-[#0B0B0A] border-2 border-white shadow-2xl flex items-center justify-center font-bold text-xs">
              <svg class="w-4 h-4" fill="#0B0B0A" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true,
        title: villaName || "Villa Location",
      }).addTo(map);

      // Handle marker drag
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const newLat = Number(pos.lat.toFixed(5));
        const newLng = Number(pos.lng.toFixed(5));
        onChangeCoordinatesRef.current(newLat, newLng);
      });

      // Handle click anywhere on real map
      map.on("click", (e) => {
        const newLat = Number(e.latlng.lat.toFixed(5));
        const newLng = Number(e.latlng.lng.toFixed(5));
        marker.setLatLng([newLat, newLng]);
        onChangeCoordinatesRef.current(newLat, newLng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
      setIsReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, villaName]);

  // 2. Update Marker Position when props change externally (e.g. preset clicked)
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current || !isReady) return;

    const currentPos = markerRef.current.getLatLng();
    if (
      Math.abs(currentPos.lat - latitude) > 0.0001 ||
      Math.abs(currentPos.lng - longitude) > 0.0001
    ) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 0.8 });
    }
  }, [latitude, longitude, isReady]);

  // 3. Tile Layer Switcher
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current) return;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const url = isSatellite
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

      const newLayer = L.tileLayer(url, { maxZoom: 19 }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    });
  }, [isSatellite, isReady]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
        <span className="font-semibold text-[#171513] dark:text-[#F4EFE5] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C89B4A]" />
          <span>Real Interactive Udaipur Map (Click or drag pin to set location)</span>
        </span>

        {/* Satellite Toggle */}
        <button
          type="button"
          onClick={() => setIsSatellite(!isSatellite)}
          className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-[#171513] dark:text-[#F4EFE5] hover:border-[#C89B4A] transition-all flex items-center gap-1 shadow-xs"
        >
          {isSatellite ? (
            <>
              <Layers className="w-3 h-3 text-[#C89B4A]" />
              <span>Switch to Street Map</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-[#C89B4A]" />
              <span>Satellite 4K View</span>
            </>
          )}
        </button>
      </div>

      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-[#DDD5C7] dark:border-[#302D28] shadow-inner bg-[#12110F]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
