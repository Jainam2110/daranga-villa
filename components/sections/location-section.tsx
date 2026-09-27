"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
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
      className="py-12 sm:py-16 lg:py-20 bg-[#F7F7F6] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF9] border-t border-[#E8E8E8] dark:border-[#383838] relative overflow-hidden"
    >
      <Container>
        {/* Section Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 lg:mb-10 gap-6 border-b border-[#E8E8E8] dark:border-[#383838] pb-5">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#EFA1AA] flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[#EFA1AA]" />
              <span>ESTATE LOCATIONS • UDAIPUR, RAJASTHAN</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#202020] dark:text-[#FCFBF9] tracking-tight leading-[1.1]">
              Sanctuaries Across Udaipur. <br className="hidden sm:inline" />
              <span className="font-light text-[#555555] dark:text-[#BDBDBD]">One Timeless Experience.</span>
            </h2>
          </div>

          <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm font-normal leading-relaxed max-w-md">
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
                className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-300 relative group flex-1 min-w-[220px] max-w-full ${
                  isSelected
                    ? "bg-[#202020] text-white border-[#202020] shadow-md dark:bg-[#FCFBF9] dark:text-[#202020]"
                    : "bg-white dark:bg-[#202020] hover:bg-[#FCFBF9] text-[#202020] dark:text-[#FCFBF9] border-[#E8E8E8] dark:border-[#383838] hover:border-[#202020]/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-mono text-[10px] font-bold tracking-widest ${
                      isSelected ? "text-[#EFA1AA]" : "text-[#777777]"
                    }`}
                  >
                    ESTATE {loc.number}
                  </span>
                  <MapPin
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "text-[#EFA1AA]" : "text-[#777777]"
                    }`}
                  />
                </div>
                <div className="font-serif text-sm sm:text-base font-semibold leading-snug line-clamp-1">
                  {loc.name.replace("Daranga ", "")}
                </div>
                <div
                  className={`text-[10px] sm:text-[11px] font-normal mt-0.5 truncate ${
                    isSelected ? "text-stone-300 dark:text-stone-600" : "text-[#555555] dark:text-[#BDBDBD]"
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
            <div className="w-full h-[440px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-[#E8E8E8] dark:border-[#383838] bg-white dark:bg-[#202020] shadow-sm flex-1 flex flex-col">
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
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-sm relative overflow-hidden space-y-5">
              {/* Photo Preview Thumbnail */}
              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden border border-[#E8E8E8] dark:border-[#383838] group">
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
                  <span className="px-2.5 py-1 rounded-full bg-[#202020] text-white text-[10px] font-mono font-bold tracking-widest shadow-sm">
                    ESTATE {selectedLocation.number}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F6C7CA]">
                    {selectedLocation.zone}
                  </div>
                  <div className="font-serif text-lg sm:text-xl text-white font-medium truncate">
                    {selectedLocation.name}
                  </div>
                </div>
              </div>

              {/* Narrative Description & Highlights */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-normal text-[#555555] dark:text-[#BDBDBD] leading-relaxed">
                  {selectedLocation.description}
                </p>

                {/* Feature Tags */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selectedLocation.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-[11px] text-[#202020] dark:text-[#FCFBF9] font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7658] flex-shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transit Distances from this Sanctuary */}
              <div className="pt-3 border-t border-[#E8E8E8] dark:border-[#383838] space-y-2">
                <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#555555] dark:text-[#BDBDBD]">
                  TRANSIT PROXIMITY
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838]">
                    <div className="text-[9px] text-[#777777] uppercase font-medium">Airport</div>
                    <div className="font-mono text-xs font-bold text-[#202020] dark:text-[#FCFBF9] mt-0.5">
                      {selectedLocation.distanceToAirport.split(" ")[0]}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838]">
                    <div className="text-[9px] text-[#777777] uppercase font-medium">City Palace</div>
                    <div className="font-mono text-xs font-bold text-[#202020] dark:text-[#FCFBF9] mt-0.5">
                      {selectedLocation.distanceToCityPalace.split(" ")[0]}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838]">
                    <div className="text-[9px] text-[#777777] uppercase font-medium">Station</div>
                    <div className="font-mono text-xs font-bold text-[#202020] dark:text-[#FCFBF9] mt-0.5">
                      {selectedLocation.distanceToStation.split(" ")[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={selectedLocation.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#202020] hover:bg-[#171717] text-white text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span>OPEN IN GOOGLE MAPS</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white dark:bg-[#202020] text-[#202020] dark:text-[#FCFBF9] border border-[#DCDCDC] dark:border-[#383838] text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#F7F7F6]"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#202020] dark:text-white" />
                  <span>GET DIRECTIONS</span>
                </a>
              </div>
            </div>

            {/* General Transit Hubs in Udaipur */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] space-y-3 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#555555] dark:text-[#BDBDBD] flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[#EFA1AA]" />
                <span>UDAIPUR CONNECTIVITY</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TRANSIT_HUBS.map((hub, i) => {
                  const Icon = hub.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-[#DDEEFF] text-[#202020] border border-[#DDEEFF] flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#202020]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-[#202020] dark:text-[#FCFBF9] leading-tight truncate">
                          {hub.title.split("(")[0]}
                        </div>
                        <div className="text-[10px] font-mono text-[#555555] dark:text-[#BDBDBD] mt-0.5">
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
