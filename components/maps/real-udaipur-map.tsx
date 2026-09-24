"use client";

import React, { useState } from "react";
import { MapPin, ExternalLink, Satellite, Map as MapIcon, Globe } from "lucide-react";
import { UdaipurLocation } from "@/components/sections/location-section";

interface RealUdaipurMapProps {
  locations: UdaipurLocation[];
  selectedLocation?: UdaipurLocation;
  onSelectLocation: (loc: UdaipurLocation) => void;
}

type GoogleMapMode = "street" | "satellite" | "terrain";

export function RealUdaipurMap({
  locations = [],
  selectedLocation,
  onSelectLocation,
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
    <div className="relative w-full h-full bg-[#12110F] overflow-hidden rounded-[16px] select-none border border-[var(--border-color)] flex flex-col shadow-2xl">
      {/* 1. Interactive Google Map Iframe Container */}
      <div className="relative w-full h-full flex-1 overflow-hidden bg-[#151412]">
        <iframe
          key={`${activeLoc.id}-${mapMode}-${activeLoc.coordinates?.lat}-${activeLoc.coordinates?.lng}`}
          title={`${activeLoc.name} - Google Maps Location`}
          src={getEmbedSrc()}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: "100%", filter: "contrast(1.03) saturate(1.05)" }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full absolute inset-0"
        />
      </div>

      {/* 2. Map Top Control Bar (Overlay) */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Active Property Pill */}
        <div className="px-3 sm:px-4 py-1.5 rounded-full bg-[#0B0B0A]/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-2 shadow-xl pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C89B4A] animate-ping" />
          <MapPin className="w-3.5 h-3.5 text-[#C89B4A] flex-shrink-0" />
          <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-[240px]">
            {activeLoc.name}
          </span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-[#C89B4A] text-[10px] uppercase font-mono tracking-wider hidden sm:inline">
            {activeLoc.zone}
          </span>
        </div>

        {/* Controls: Google Map Modes & Open App Link */}
        <div className="flex items-center gap-2 pointer-events-auto ml-auto">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#0B0B0A]/90 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
            <button
              type="button"
              onClick={() => setMapMode("street")}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                mapMode === "street"
                  ? "bg-[#C89B4A] text-[#0B0B0A] shadow-xs"
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
                  ? "bg-[#C89B4A] text-[#0B0B0A] shadow-xs"
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
            className="px-3 py-1.5 rounded-full bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Globe className="w-3 h-3" />
            <span className="hidden sm:inline">Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 3. Multi-Estate Switcher Bar (Only if multiple locations provided) */}
      {locations.length > 1 && (
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
                    ? "bg-[#C89B4A] text-[#0B0B0A] font-bold border border-white/40 scale-105"
                    : "bg-[#0B0B0A]/85 hover:bg-[#0B0B0A] text-stone-200 border border-white/15 hover:border-[#C89B4A]/60"
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
