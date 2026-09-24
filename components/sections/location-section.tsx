"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Compass,
  Sparkles,
  Plane,
  Train,
  Car,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Villa } from "@/types/villa";
import { getPrimaryVillaImageUrl } from "@/lib/utils/image";
import { getVillaAddress } from "@/lib/utils/villa-location";
import { RealUdaipurMap } from "@/components/maps/real-udaipur-map";

export interface UdaipurLocation {
  id: string;
  number: string;
  name: string;
  tagline: string;
  zone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapPos: {
    x: number; // 0 to 100%
    y: number; // 0 to 100%
  };
  imageUrl: string;
  highlights: string[];
  distanceToAirport: string;
  distanceToCityPalace: string;
  distanceToStation: string;
  description: string;
  googleMapsUrl: string;
  slug?: string;
}

const TRANSIT_HUBS = [
  {
    title: "Maharana Pratap Airport (UDR)",
    distance: "28 - 36 km",
    time: "40 - 50 mins",
    detail: "Direct flights from Mumbai, Delhi, Bengaluru, Jaipur",
    icon: Plane,
  },
  {
    title: "Udaipur City Railway Station",
    distance: "6 - 14 km",
    time: "15 - 30 mins",
    detail: "Vande Bharat & Superfast connectivity",
    icon: Train,
  },
  {
    title: "City Palace & Old City",
    distance: "3.5 - 11 km",
    time: "10 - 25 mins",
    detail: "Seamless luxury chauffeur transfers available",
    icon: Car,
  },
];

interface LocationSectionProps {
  villas?: Villa[];
}

export function LocationSection({ villas = [] }: LocationSectionProps) {
  // Extract ONLY real villas from Database / Props - zero mock hardcoded estates
  const allLocations = useMemo<UdaipurLocation[]>(() => {
    if (!villas || villas.length === 0) {
      return [];
    }

    return villas.map((v, index) => {
      // Use exact coordinates configured in admin / database
      const lat =
        v.latitude !== undefined && v.latitude !== null && !isNaN(Number(v.latitude))
          ? Number(v.latitude)
          : 24.5854 + index * 0.012;
      const lng =
        v.longitude !== undefined && v.longitude !== null && !isNaN(Number(v.longitude))
          ? Number(v.longitude)
          : 73.6780 + index * 0.012;
      const posX = v.mapX !== undefined && !isNaN(Number(v.mapX)) ? Number(v.mapX) : 50;
      const posY = v.mapY !== undefined && !isNaN(Number(v.mapY)) ? Number(v.mapY) : 50;
      const coverImg = getPrimaryVillaImageUrl(v.images) || "/images/hero/heroimg.webp";
      const dynamicId = v.id || v._id || `villa-${index}`;

      const highlights =
        v.highlights && v.highlights.length > 0
          ? v.highlights
          : v.amenities && v.amenities.length > 0
          ? v.amenities.slice(0, 4)
          : ["Private Pool", "Aravalli Mountain Views", "24/7 Butler", "Lakeside Access"];

      return {
        id: dynamicId,
        number: String(index + 1).padStart(2, "0"),
        name: v.name.startsWith("Daranga") ? v.name : `Daranga ${v.name}`,
        tagline: v.tagline || v.description?.slice(0, 60) || "Private Luxury Villa Residence",
        zone: v.zone || getVillaAddress(v.location, "Udaipur, Rajasthan"),
        address: getVillaAddress(v.location, "Udaipur, Rajasthan"),
        coordinates: { lat, lng },
        mapPos: {
          x: Math.min(90, Math.max(10, posX)),
          y: Math.min(90, Math.max(10, posY)),
        },
        imageUrl: coverImg,
        highlights,
        distanceToAirport: "28 - 36 km (45 min)",
        distanceToCityPalace: "4 - 8 km (15 min)",
        distanceToStation: "6 - 12 km (20 min)",
        description:
          v.description ||
          "An exclusive private sanctuary designed for quiet elegance, architectural serenity, and uncompromised hospitality.",
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        slug: v.slug,
      };
    });
  }, [villas]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLocation = useMemo<UdaipurLocation | null>(() => {
    if (allLocations.length === 0) return null;
    const found = allLocations.find((l) => l.id === selectedId);
    return found || allLocations[0];
  }, [allLocations, selectedId]);

  // If no villas are loaded yet, don't show an empty or broken map
  if (allLocations.length === 0 || !selectedLocation) {
    return null;
  }

  return (
    <section
      id="location"
      className="py-24 lg:py-36 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-t border-[var(--border-color)] relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-[500px] h-[500px] bg-[#C89B4A]/5 rounded-full blur-[120px] pointer-events-none" />

      <Container>
        {/* Section Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 lg:mb-16 gap-6 border-b border-[var(--border-color)] pb-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[var(--accent)] animate-spin-slow" />
              <span>ESTATE LOCATIONS • UDAIPUR, RAJASTHAN</span>
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[var(--text-primary)] tracking-tight leading-[1.08]">
              Sanctuaries Across Udaipur. <br className="hidden sm:inline" />
              <span className="italic font-light text-[#C89B4A]">One Timeless Legacy.</span>
            </h2>
          </div>

          <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-light leading-relaxed max-w-md">
            Discover our collection of private luxury estates strategically nestled across Udaipur’s iconic lakes, royal valleys, and serene Aravalli mountain foothills.
          </p>
        </div>

        {/* Location Selector Navigation Pills */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-8">
          {allLocations.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedId(loc.id)}
                className={`text-left p-3.5 sm:p-4 rounded-[12px] border transition-all duration-300 relative group flex-1 min-w-[220px] max-w-full ${
                  isSelected
                    ? "bg-[#C89B4A] text-[#0B0B0A] border-[#C89B4A] shadow-lg scale-[1.02]"
                    : "bg-[var(--bg-primary)]/80 hover:bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[#C89B4A]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-mono text-[10px] font-bold tracking-widest ${
                      isSelected ? "text-[#0B0B0A]/80" : "text-[var(--accent)]"
                    }`}
                  >
                    ESTATE {loc.number}
                  </span>
                  <MapPin
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "text-[#0B0B0A]" : "text-[var(--accent)]"
                    }`}
                  />
                </div>
                <div className="font-serif text-sm sm:text-base font-semibold leading-snug line-clamp-1">
                  {loc.name.replace("Daranga ", "")}
                </div>
                <div
                  className={`text-[10px] sm:text-[11px] font-light mt-0.5 truncate ${
                    isSelected ? "text-[#0B0B0A]/90" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {loc.zone}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Map & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Real Interactive Google Maps Udaipur Map (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="w-full h-[440px] sm:h-[500px] lg:h-[600px] rounded-[16px] overflow-hidden border border-[var(--border-color)] bg-[#12110F] shadow-2xl flex-1 flex flex-col">
              <RealUdaipurMap
                locations={allLocations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => setSelectedId(loc.id)}
              />
            </div>
          </div>

          {/* Right Column: Selected Sanctuary Details & Transits (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Active Sanctuary Editorial Showcase Card */}
            <div className="p-6 sm:p-7 rounded-[16px] bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-xl relative overflow-hidden space-y-5">
              {/* Photo Preview Thumbnail */}
              <div className="relative h-44 sm:h-52 w-full rounded-[10px] overflow-hidden border border-[var(--border-color)] group">
                <Image
                  src={selectedLocation.imageUrl}
                  alt={selectedLocation.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Location Badges */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-[4px] bg-[#C89B4A] text-[#0B0B0A] text-[10px] font-mono font-bold tracking-widest shadow-md">
                    ESTATE {selectedLocation.number}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B4A]">
                    {selectedLocation.zone}
                  </div>
                  <div className="font-serif text-lg sm:text-xl text-white font-medium truncate">
                    {selectedLocation.name}
                  </div>
                </div>
              </div>

              {/* Narrative Description & Highlights */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] leading-relaxed">
                  {selectedLocation.description}
                </p>

                {/* Feature Tags */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selectedLocation.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-[11px] text-[var(--text-primary)] font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transit Distances from this Sanctuary */}
              <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--accent)]">
                  TRANSIT PROXIMITY
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="text-[9px] text-[var(--text-secondary)] uppercase">Airport</div>
                    <div className="font-mono text-xs font-bold text-[var(--text-primary)] mt-0.5">
                      {selectedLocation.distanceToAirport.split(" ")[0]}
                    </div>
                  </div>
                  <div className="p-2 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="text-[9px] text-[var(--text-secondary)] uppercase">City Palace</div>
                    <div className="font-mono text-xs font-bold text-[var(--text-primary)] mt-0.5">
                      {selectedLocation.distanceToCityPalace.split(" ")[0]}
                    </div>
                  </div>
                  <div className="p-2 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="text-[9px] text-[var(--text-secondary)] uppercase">Station</div>
                    <div className="font-mono text-xs font-bold text-[var(--text-primary)] mt-0.5">
                      {selectedLocation.distanceToStation.split(" ")[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={selectedLocation.slug ? `/villas/${selectedLocation.slug}` : "/villas"}
                  className="w-full sm:flex-1 py-3 px-4 rounded-[6px] bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-[0.18em] font-bold text-center transition-all shadow-md hover:scale-[1.02] active:scale-95"
                >
                  EXPLORE RESIDENCE
                </Link>
                <a
                  href={selectedLocation.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-4 rounded-[6px] bg-[var(--bg-secondary)] hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-primary)] border border-[var(--border-color)] text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 transition-all hover:border-[var(--accent)]"
                >
                  <Navigation className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>DIRECTIONS</span>
                </a>
              </div>
            </div>

            {/* General Transit Hubs in Udaipur */}
            <div className="p-4 sm:p-5 rounded-[12px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                <span>UDAIPUR CONNECTIVITY</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TRANSIT_HUBS.map((hub, i) => {
                  const Icon = hub.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="p-2 rounded-[6px] bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--border-color)] flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-[var(--text-primary)] leading-tight truncate">
                          {hub.title.split("(")[0]}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">
                          {hub.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
