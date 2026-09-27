"use client";

import React, { useState } from "react";
import { MapPin, ExternalLink, Satellite, Map as MapIcon, Globe } from "lucide-react";
import { UdaipurLocation } from "@/components/sections/location-section";

interface RealUdaipurMapProps {
  locations?: UdaipurLocation[];
  selectedLocation?: UdaipurLocation;
  onSelectLocation?: (loc: UdaipurLocation) => void;
  showControls?: boolean;
  showActivePill?: boolean;
  showEstateSwitcher?: boolean;
}

type GoogleMapMode = "street" | "satellite" | "terrain";

export function RealUdaipurMap({
  locations = [],
  selectedLocation,
  onSelectLocation,
  showControls = false,
  showActivePill = false,
  showEstateSwitcher = false,
}: RealUdaipurMapProps) {
  const [mapMode, setMapMode] = useState<GoogleMapMode>("street");

  const activeLoc = selectedLocation || locations[0] || {
    id: "default",
    number: "01",
    name: "Daranga Villa Sanctuary",
    zone: "Udaipur, Rajasthan",
    address: "Udaipur, Rajasthan",
    coordinates: { lat: 24.5854, lng: 73.6780 },
    mapPos: { x: 50, y: 50 },
    imageUrl: "/images/hero/heroimg.webp",
    highlights: ["Private Pool", "Aravalli Mountain Views"],
    distanceToAirport: "28 - 36 km (45 min)",
    distanceToCityPalace: "4 - 8 km (15 min)",
    distanceToStation: "6 - 12 km (20 min)",
    description: "Exclusive private luxury villa residence in Udaipur.",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=24.5854,73.6780",
  };

  const getEmbedSrc = (): string => {
    // If the admin provided a custom Google Maps embed URL
    if (activeLoc.googleMapsUrl && activeLoc.googleMapsUrl.includes("maps/embed")) {
      return activeLoc.googleMapsUrl;
    }

    const tCode = mapMode === "satellite" ? "k" : mapMode === "terrain" ? "p" : "m";
    const lat =
      activeLoc.coordinates?.lat !== undefined && !isNaN(activeLoc.coordinates.lat)
        ? activeLoc.coordinates.lat
        : 24.5854;
    const lng =
      activeLoc.coordinates?.lng !== undefined && !isNaN(activeLoc.coordinates.lng)
        ? activeLoc.coordinates.lng
        : 73.678;

    return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=16&t=${tCode}&output=embed`;
  };

  const directGoogleMapsLink =
    activeLoc.coordinates?.lat !== undefined &&
    activeLoc.coordinates?.lng !== undefined &&
    !isNaN(activeLoc.coordinates.lat) &&
    !isNaN(activeLoc.coordinates.lng)
      ? `https://www.google.com/maps/search/?api=1&query=${activeLoc.coordinates.lat},${activeLoc.coordinates.lng}`
      : activeLoc.googleMapsUrl && activeLoc.googleMapsUrl.trim()
      ? activeLoc.googleMapsUrl.trim()
      : `https://www.google.com/maps/search/?api=1&query=24.5854,73.6780`;

  return (
    <div className="relative w-full h-full bg-white dark:bg-[#202020] overflow-hidden rounded-[12px] select-none border border-[#E8E6E2] dark:border-[#383633] flex flex-col shadow-xs">
      {/* 1. Pure Interactive Google Map Iframe Container */}
      <div className="relative w-full h-full flex-1 overflow-hidden bg-[#F7F6F3] dark:bg-[#171717]">
        <iframe
          key={`${activeLoc.id}-${mapMode}-${activeLoc.coordinates?.lat}-${activeLoc.coordinates?.lng}`}
          title={`${activeLoc.name} - Google Maps Location`}
          src={getEmbedSrc()}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: "100%", filter: "contrast(1.02) saturate(1.02)" }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full absolute inset-0"
        />
      </div>

      {/* 2. Optional Map Top Control Bar */}
      {(showActivePill || showControls) && (
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Active Property Pill */}
          {showActivePill && (
            <div className="px-3 sm:px-4 py-1.5 rounded-full bg-[#202020]/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-2 shadow-lg pointer-events-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EFA1AA] animate-ping" />
              <MapPin className="w-3.5 h-3.5 text-[#EFA1AA] flex-shrink-0" />
              <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-[240px]">
                {activeLoc.name}
              </span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <span className="text-[#F6C7CA] text-[10px] uppercase font-mono tracking-wider hidden sm:inline">
                {activeLoc.zone}
              </span>
            </div>
          )}

          {/* Controls: Google Map Modes & Open App Link */}
          {showControls && (
            <div className="flex items-center gap-2 pointer-events-auto ml-auto">
              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#202020]/90 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                <button
                  type="button"
                  onClick={() => setMapMode("street")}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                    mapMode === "street"
                      ? "bg-white text-[#202020] shadow-xs"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  <MapIcon className="w-3 h-3" />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode("satellite")}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                    mapMode === "satellite"
                      ? "bg-white text-[#202020] shadow-xs"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  <Satellite className="w-3 h-3" />
                  <span>Satellite</span>
                </button>
              </div>

              {/* Direct Google Maps External Button */}
              <a
                href={directGoogleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Google Maps App"
                className="px-3 py-1.5 rounded-full bg-[#202020] hover:bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-white/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <Globe className="w-3 h-3" />
                <span className="hidden sm:inline">Open in Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* 3. Optional Multi-Estate Switcher Bar */}
      {showEstateSwitcher && locations.length > 1 && onSelectLocation && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pointer-events-auto">
          {locations.map((loc) => {
            const isSelected = activeLoc.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelectLocation(loc)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 backdrop-blur-md shadow-lg flex-shrink-0 ${
                  isSelected
                    ? "bg-[#202020] text-white font-bold border border-white/40 scale-105"
                    : "bg-[#202020]/80 hover:bg-[#202020] text-stone-200 border border-white/15"
                }`}
              >
                <span className="font-mono text-[9px] opacity-75">#{loc.number}</span>
                <span>{loc.name.replace("Daranga ", "")}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
