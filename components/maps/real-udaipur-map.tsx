"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup, TileLayer } from "leaflet";
import { Layers, RotateCcw, Sparkles } from "lucide-react";
import { UdaipurLocation } from "@/components/sections/location-section";

interface RealUdaipurMapProps {
  locations: UdaipurLocation[];
  selectedLocation?: UdaipurLocation;
  onSelectLocation: (loc: UdaipurLocation) => void;
}

type MapLayerType = "street" | "satellite";

const TILE_LAYERS = {
  street: {
    name: "Street Map",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener noreferrer\">OpenStreetMap</a> contributors",
    maxZoom: 19,
  },
  satellite: {
    name: "Satellite (Real World)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
    maxZoom: 18,
  },
};

export function RealUdaipurMap({
  locations,
  selectedLocation,
  onSelectLocation,
}: RealUdaipurMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);

  const [layerType, setLayerType] = useState<MapLayerType>("street");
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      const centerLat = selectedLocation?.coordinates?.lat || 24.5854;
      const centerLng = selectedLocation?.coordinates?.lng || 73.6780;

      // Center around Udaipur
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add Tile Layer
      const currentConfig = TILE_LAYERS[layerType];
      const tileLayer = L.tileLayer(currentConfig.url, {
        attribution: currentConfig.attribution,
        maxZoom: currentConfig.maxZoom,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Layer group for pins
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [layerType, selectedLocation?.coordinates?.lat, selectedLocation?.coordinates?.lng]);

  // 2. Change Tile Layer (Street vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current) return;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const config = TILE_LAYERS[layerType];
      const newTileLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newTileLayer;
    });
  }, [layerType, isMapReady]);

  // 3. Render Real Glowing Pins for all Locations
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !isMapReady) return;

    import("leaflet").then((L) => {
      const markersLayer = markersLayerRef.current;
      if (!markersLayer) return;

      markersLayer.clearLayers();

      locations.forEach((loc) => {
        const isSelected = selectedLocation?.id === loc.id;

        // Custom HTML Pin Marker with Luxury Glowing Ripple
        const customIcon = L.divIcon({
          className: "custom-gold-marker",
          html: `
            <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
              ${
                isSelected
                  ? `<div class="absolute -inset-3.5 rounded-full bg-[#C89B4A]/40 animate-ping"></div>`
                  : ""
              }
              <div class="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${
                isSelected
                  ? "bg-[#C89B4A] text-[#0B0B0A] border-white shadow-[0_0_25px_rgba(200,155,74,0.9)] scale-115 z-30"
                  : "bg-[#171513] text-[#C89B4A] border-[#C89B4A] shadow-lg hover:scale-110 hover:bg-[#2A2722] z-10"
              }">
                <span class="font-mono font-bold text-xs tracking-tight">${loc.number}</span>
              </div>
              <div class="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-[6px] text-[10px] font-semibold tracking-wider transition-all pointer-events-none ${
                isSelected
                  ? "bg-[#C89B4A] text-[#0B0B0A] shadow-xl opacity-100"
                  : "bg-[#171513]/95 text-stone-200 border border-white/20 shadow-lg opacity-0 group-hover:opacity-100"
              }">
                ${loc.name}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], {
          icon: customIcon,
          title: loc.name,
        });

        marker.on("click", () => {
          onSelectLocation(loc);
        });

        marker.addTo(markersLayer);
      });
    });
  }, [locations, selectedLocation, onSelectLocation, isMapReady]);

  // 4. Smooth Flight Camera when Selected Location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !selectedLocation) return;

    mapInstanceRef.current.flyTo(
      [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng],
      14,
      {
        duration: 1.2,
        easeLinearity: 0.25,
      }
    );
  }, [
    selectedLocation,
    isMapReady,
  ]);

  // Reset View to fit all pins
  const handleFitAll = () => {
    if (!mapInstanceRef.current || locations.length === 0) return;
    import("leaflet").then((L) => {
      const bounds = L.latLngBounds(
        locations.map((l) => [l.coordinates.lat, l.coordinates.lng])
      );
      mapInstanceRef.current?.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
        animate: true,
      });
    });
  };

  return (
    <div className="relative w-full h-full bg-[#12110F] overflow-hidden rounded-[16px] select-none">
      {/* Real Interactive Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Active Location Info Pill */}
        {selectedLocation && (
          <div className="px-3.5 py-1.5 rounded-full bg-[#0B0B0A]/85 backdrop-blur-md border border-white/15 text-stone-200 text-[11px] font-medium flex items-center gap-2 shadow-lg pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-[#C89B4A] animate-ping" />
            <span className="font-semibold text-white">Udaipur, India</span>
            <span className="text-white/40">•</span>
            <span className="text-[#C89B4A]">{selectedLocation.zone}</span>
          </div>
        )}

        {/* Real Tile Layer Switcher & Fit View Button */}
        <div className="flex items-center gap-2 pointer-events-auto ml-auto">
          {/* Fit All Button */}
          {locations.length > 1 && (
            <button
              type="button"
              onClick={handleFitAll}
              title="Fit all villas in view"
              className="w-8 h-8 rounded-full bg-[#0B0B0A]/85 hover:bg-[#C89B4A] text-stone-300 hover:text-[#0B0B0A] border border-white/15 backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Layer Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#0B0B0A]/85 backdrop-blur-md rounded-full border border-white/15 shadow-lg">
            <button
              type="button"
              onClick={() => setLayerType("street")}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${
                layerType === "street"
                  ? "bg-[#C89B4A] text-[#0B0B0A]"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Street Map
              </span>
            </button>
            <button
              type="button"
              onClick={() => setLayerType("satellite")}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${
                layerType === "satellite"
                  ? "bg-[#C89B4A] text-[#0B0B0A]"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Satellite 4K
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Bottom GPS Bar */}
      {selectedLocation && (
        <div className="absolute bottom-3 left-4 z-20 pointer-events-none">
          <div className="px-3 py-1.5 rounded-[8px] bg-[#0B0B0A]/85 backdrop-blur-md border border-white/15 text-[10px] font-mono text-stone-300 flex items-center gap-2 shadow-lg">
            <span className="text-[#C89B4A] font-semibold">GPS:</span>
            <span>
              {selectedLocation.coordinates.lat.toFixed(4)}° N,{" "}
              {selectedLocation.coordinates.lng.toFixed(4)}° E
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
