"use client";

import React from "react";

// Line art SVG Icons matching the StayVista / reference screenshot style
export function BbqIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Flames */}
      <path d="M24 8C24 8 26 12 24 15C22 12 24 8 24 8Z" />
      <path d="M20 10C20 10 21.5 13 20 15" />
      <path d="M28 10C28 10 26.5 13 28 15" />
      {/* Grill Bowl */}
      <path d="M12 18C12 25 17.5 30 24 30C30.5 30 36 25 36 18H12Z" />
      <line x1="10" y1="18" x2="38" y2="18" />
      {/* Legs */}
      <line x1="16" y1="30" x2="12" y2="42" />
      <line x1="32" y1="30" x2="36" y2="42" />
      <line x1="24" y1="30" x2="24" y2="42" />
      {/* Shelf */}
      <line x1="15" y1="37" x2="33" y2="37" />
    </svg>
  );
}

export function PoolIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Pool Ladder */}
      <path d="M16 6V22" />
      <path d="M16 6C16 4 18 3 20 3C22 3 24 4 24 6V22" />
      <line x1="16" y1="11" x2="24" y2="11" />
      <line x1="16" y1="16" x2="24" y2="16" />
      <path d="M24 6C24 4 26 3 28 3C30 3 32 4 32 6V22" />
      <line x1="24" y1="11" x2="32" y2="11" />
      <line x1="24" y1="16" x2="32" y2="16" />
      {/* Waves */}
      <path d="M8 26C11 24 14 28 17 26C20 24 23 28 26 26C29 24 32 28 35 26C38 24 41 28 44 26" />
      <path d="M8 32C11 30 14 34 17 32C20 30 23 34 26 32C29 30 32 34 35 32C38 30 41 34 44 32" />
      <path d="M8 38C11 36 14 40 17 38C20 36 23 40 26 38C29 36 32 40 35 38C38 36 41 40 44 38" />
    </svg>
  );
}

export function BonfireIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Logs */}
      <path d="M10 38L38 32" />
      <path d="M10 32L38 38" />
      <ellipse cx="10" cy="35" rx="2" ry="3" />
      <ellipse cx="38" cy="35" rx="2" ry="3" />
      {/* Flames */}
      <path d="M24 6C20 12 15 18 15 26C15 31 18.5 33 24 33C29.5 33 33 31 33 26C33 20 28 14 24 6Z" />
      <path d="M24 16C22 20 20 23 20 27C20 29 22 31 24 31C26 31 28 29 28 27C28 24 26 20 24 16Z" />
    </svg>
  );
}

export function LawnIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Grass blades */}
      <path d="M10 40C12 28 16 20 24 16C20 24 18 32 18 40" />
      <path d="M24 40C24 28 26 18 34 14C30 24 28 32 28 40" />
      <path d="M38 40C36 30 34 22 28 18C32 26 34 34 34 40" />
      <path d="M10 40H38" />
      {/* Butterflies */}
      <path d="M13 14C11 12 11 9 14 10C16 9 18 12 16 14C18 16 16 19 14 18C11 19 11 16 13 14Z" strokeWidth="1.4" />
      <path d="M33 10C31 8 31 6 34 7C36 6 37 8 36 10C37 12 36 14 34 13C31 14 31 12 33 10Z" strokeWidth="1.4" />
    </svg>
  );
}

export function GazeboIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Roof */}
      <path d="M24 6L8 16H40L24 6Z" />
      <path d="M24 6V10" />
      {/* Eaves */}
      <line x1="8" y1="16" x2="40" y2="16" />
      <line x1="8" y1="20" x2="40" y2="20" />
      {/* Pillars */}
      <line x1="12" y1="20" x2="12" y2="38" />
      <line x1="20" y1="20" x2="20" y2="38" />
      <line x1="28" y1="20" x2="28" y2="38" />
      <line x1="36" y1="20" x2="36" y2="38" />
      {/* Base */}
      <line x1="8" y1="38" x2="40" y2="38" />
      {/* Arches */}
      <path d="M12 25C14 23 18 23 20 25" />
      <path d="M20 25C22 23 26 23 28 25" />
      <path d="M28 25C30 23 34 23 36 25" />
    </svg>
  );
}

export function TvIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="10" width="36" height="24" rx="2" />
      <line x1="12" y1="34" x2="8" y2="38" />
      <line x1="36" y1="34" x2="40" y2="38" />
      <line x1="6" y1="30" x2="42" y2="30" />
    </svg>
  );
}

export function BalconyIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Door */}
      <path d="M16 28V16C16 11.5 19.5 8 24 8C28.5 8 32 11.5 32 16V28" />
      <line x1="24" y1="8" x2="24" y2="28" />
      <line x1="16" y1="18" x2="32" y2="18" />
      {/* Railing */}
      <path d="M10 28H38V36H10V28Z" />
      <line x1="15" y1="28" x2="15" y2="36" />
      <line x1="21" y1="28" x2="21" y2="36" />
      <line x1="27" y1="28" x2="27" y2="36" />
      <line x1="33" y1="28" x2="33" y2="36" />
      {/* Base */}
      <path d="M8 36H40V40H8V36Z" />
    </svg>
  );
}

export function SpeakerIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Main Amp */}
      <rect x="18" y="14" width="12" height="26" rx="2" />
      <circle cx="24" cy="21" r="3" />
      <circle cx="24" cy="31" r="4.5" />
      {/* Left Speaker */}
      <rect x="8" y="18" width="8" height="22" rx="1.5" />
      <circle cx="12" cy="24" r="2" />
      <circle cx="12" cy="32" r="3" />
      {/* Right Speaker */}
      <rect x="32" y="18" width="8" height="22" rx="1.5" />
      <circle cx="36" cy="24" r="2" />
      <circle cx="36" cy="32" r="3" />
      {/* Notes */}
      <path d="M12 9V13M12 9L16 7V11" strokeWidth="1.4" />
      <circle cx="10" cy="13" r="1.5" />
      <circle cx="14" cy="11" r="1.5" />
      <path d="M34 9V13M34 9L38 7V11" strokeWidth="1.4" />
      <circle cx="32" cy="13" r="1.5" />
      <circle cx="36" cy="11" r="1.5" />
    </svg>
  );
}

export function GamesIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Sneaker */}
      <path d="M18 18L22 26L32 26L38 30C40 31 42 34 38 36H10C8 36 6 34 8 32L12 22L18 18Z" />
      <path d="M18 18C18 18 20 14 26 14C28 14 30 16 30 18L28 22" />
      <line x1="8" y1="34" x2="38" y2="34" />
      {/* Speed lines */}
      <line x1="6" y1="22" x2="10" y2="22" />
      <line x1="4" y1="26" x2="12" y2="26" />
      <line x1="6" y1="30" x2="10" y2="30" />
    </svg>
  );
}

export function WifiIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 16C18 10 30 10 38 16" />
      <path d="M15 22C20 17 28 17 33 22" />
      <path d="M20 28C22 25 26 25 28 28" />
      <circle cx="24" cy="35" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function AcIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="10" width="36" height="16" rx="2" />
      <line x1="10" y1="20" x2="38" y2="20" />
      <line x1="32" y1="15" x2="36" y2="15" />
      {/* Air Breeze Waves */}
      <path d="M12 30C16 34 20 34 24 30" />
      <path d="M20 36C24 40 28 40 32 36" />
      <path d="M28 30C32 34 36 34 40 30" />
    </svg>
  );
}

export function KitchenIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 8V22C12 26 15 28 18 28V40" />
      <path d="M15 8V18" />
      <path d="M18 8V18" />
      <path d="M30 8C33 8 36 12 36 18C36 24 33 28 30 28V40" />
      <line x1="30" y1="8" x2="30" y2="40" />
    </svg>
  );
}

export function ParkingIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="24" cy="24" r="18" />
      <path d="M20 34V14H26C29 14 31 16 31 19C31 22 29 24 26 24H20" />
    </svg>
  );
}

export function GeyserIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="14" y="8" width="20" height="28" rx="6" />
      <circle cx="24" cy="22" r="4" />
      <line x1="20" y1="36" x2="20" y2="42" />
      <line x1="28" y1="36" x2="28" y2="42" />
    </svg>
  );
}

export function HousekeepingIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 10L24 6L32 10V22C32 30 24 38 24 38C24 38 16 30 16 22V10Z" />
      <path d="M20 20L23 23L29 17" strokeWidth="2" />
    </svg>
  );
}

export function DefaultAmenityIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M24 8L26.5 17.5L36 20L26.5 22.5L24 32L21.5 22.5L12 20L21.5 17.5L24 8Z" />
      <path d="M34 30L35 34L39 35L35 36L34 40L33 36L29 35L33 34L34 30Z" />
    </svg>
  );
}

// Function to resolve proper line art SVG icon
export function renderAmenityIcon(name: string, className?: string) {
  const lower = (name || "").toLowerCase().trim();

  if (lower.includes("bbq") || lower.includes("barbecue") || lower.includes("grill")) {
    return <BbqIcon className={className} />;
  }
  if (lower.includes("pool") || lower.includes("swim") || lower.includes("jacuzzi")) {
    return <PoolIcon className={className} />;
  }
  if (lower.includes("bonfire") || lower.includes("fire") || lower.includes("heater") || lower.includes("fireplace")) {
    return <BonfireIcon className={className} />;
  }
  if (lower.includes("lawn") || lower.includes("garden") || lower.includes("grass")) {
    return <LawnIcon className={className} />;
  }
  if (lower.includes("gazebo") || lower.includes("pavilion") || lower.includes("patio")) {
    return <GazeboIcon className={className} />;
  }
  if (lower.includes("tv") || lower.includes("television") || lower.includes("netflix")) {
    return <TvIcon className={className} />;
  }
  if (lower.includes("balcony") || lower.includes("terrace") || lower.includes("deck") || lower.includes("view")) {
    return <BalconyIcon className={className} />;
  }
  if (lower.includes("music") || lower.includes("speaker") || lower.includes("sound") || lower.includes("audio")) {
    return <SpeakerIcon className={className} />;
  }
  if (lower.includes("game") || lower.includes("sports") || lower.includes("activity") || lower.includes("indoor") || lower.includes("outdoor")) {
    return <GamesIcon className={className} />;
  }
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet") || lower.includes("fiber")) {
    return <WifiIcon className={className} />;
  }
  if (lower.includes("ac") || lower.includes("air condition") || lower.includes("climate") || lower.includes("cooling")) {
    return <AcIcon className={className} />;
  }
  if (lower.includes("kitchen") || lower.includes("cook") || lower.includes("chef") || lower.includes("dining") || lower.includes("meal")) {
    return <KitchenIcon className={className} />;
  }
  if (lower.includes("parking") || lower.includes("car") || lower.includes("valet")) {
    return <ParkingIcon className={className} />;
  }
  if (lower.includes("shower") || lower.includes("geyser") || lower.includes("hot water") || lower.includes("bath")) {
    return <GeyserIcon className={className} />;
  }
  if (lower.includes("butler") || lower.includes("housekeeping") || lower.includes("service") || lower.includes("security") || lower.includes("concierge")) {
    return <HousekeepingIcon className={className} />;
  }

  return <DefaultAmenityIcon className={className} />;
}

// Map of known paid / on-demand amenity prices (like in StayVista app reference)
export const KNOWN_AMENITY_PRICING: Record<string, { price: string; isPaid: boolean }> = {
  bbq: { price: "₹1,200", isPaid: true },
  barbecue: { price: "₹1,200", isPaid: true },
  "barbecue & grill": { price: "₹1,200", isPaid: true },
  bonfire: { price: "₹1,500", isPaid: true },
  "bonfire & logs": { price: "₹1,500", isPaid: true },
  "chef on demand": { price: "₹1,500", isPaid: true },
  "private chef": { price: "₹1,500", isPaid: true },
  "floating breakfast": { price: "₹1,000", isPaid: true },
  "in-villa spa": { price: "₹2,000", isPaid: true },
};

export function getAmenityPricing(name: string): { price?: string; isPaid: boolean } {
  const lower = (name || "").toLowerCase().trim();
  for (const [key, val] of Object.entries(KNOWN_AMENITY_PRICING)) {
    if (lower.includes(key)) {
      return val;
    }
  }
  return { isPaid: false };
}

interface AmenityIconProps {
  name: string;
  className?: string;
  iconClassName?: string;
}

export function AmenityIcon({
  name,
  className = "w-4 h-4",
  iconClassName,
}: AmenityIconProps) {
  const svgClass = iconClassName || className;
  return (
    <span className="inline-flex items-center justify-center flex-shrink-0" title={name}>
      {renderAmenityIcon(name, svgClass)}
    </span>
  );
}

// Curated standard presets for Admin amenities picker
export const STANDARD_LUXURY_AMENITIES: string[] = [
  "BBQ",
  "Private Pool",
  "Bonfire",
  "Lawn",
  "Gazebo",
  "TV",
  "Balcony/ Terrace",
  "Music System/ Speaker",
  "Indoor/ Outdoor Games",
  "High-Speed Wi-Fi",
  "Air Conditioning",
  "Gourmet Kitchen",
  "Daily Butler & Housekeeping",
  "Hot Water & Luxury Bath",
  "100% Power Backup",
  "Private Parking",
  "24/7 Security & Concierge",
  "Private Chef",
  "Floating Breakfast",
];
