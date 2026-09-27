import React from "react";
import {
  Waves,
  Wind,
  Flame,
  Wifi,
  Car,
  Utensils,
  UtensilsCrossed,
  Coffee,
  Tv,
  Volume2,
  Sparkles,
  Bath,
  ShowerHead,
  Dumbbell,
  Trees,
  Sun,
  Mountain,
  BellRing,
  ShieldCheck,
  Zap,
  Laptop,
  PawPrint,
  LucideIcon,
} from "lucide-react";

export function getAmenityLucideIcon(name: string): LucideIcon {
  const lower = (name || "").toLowerCase().trim();

  // Pool & Water
  if (lower.includes("pool") || lower.includes("swim") || lower.includes("jacuzzi") || lower.includes("hot tub")) {
    return Waves;
  }

  // Climate / AC / Heating
  if (lower.includes("ac") || lower.includes("air condition") || lower.includes("climate") || lower.includes("cooling") || lower.includes("fan")) {
    return Wind;
  }
  if (lower.includes("heater") || lower.includes("heating") || lower.includes("fireplace") || lower.includes("bonfire") || lower.includes("fire")) {
    return Flame;
  }

  // Internet & Connectivity
  if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("internet") || lower.includes("broadband") || lower.includes("fiber")) {
    return Wifi;
  }

  // Parking & Transport
  if (lower.includes("parking") || lower.includes("car") || lower.includes("valet") || lower.includes("garage") || lower.includes("ev charge")) {
    return Car;
  }

  // Kitchen & Dining
  if (lower.includes("coffee") || lower.includes("espresso") || lower.includes("tea") || lower.includes("bar")) {
    return Coffee;
  }
  if (lower.includes("kitchen") || lower.includes("cook") || lower.includes("chef") || lower.includes("culinary")) {
    return UtensilsCrossed;
  }
  if (lower.includes("dining") || lower.includes("breakfast") || lower.includes("meal") || lower.includes("restaurant") || lower.includes("barbecue") || lower.includes("bbq") || lower.includes("fridge") || lower.includes("microwave")) {
    return Utensils;
  }

  // Entertainment
  if (lower.includes("tv") || lower.includes("television") || lower.includes("netflix") || lower.includes("cinema") || lower.includes("theater")) {
    return Tv;
  }
  if (lower.includes("sound") || lower.includes("speaker") || lower.includes("audio") || lower.includes("music")) {
    return Volume2;
  }

  // Bathroom & Wellness
  if (lower.includes("shower") || lower.includes("geyser") || lower.includes("hot water")) {
    return ShowerHead;
  }
  if (lower.includes("bath") || lower.includes("spa") || lower.includes("tub") || lower.includes("toiletries")) {
    return Bath;
  }
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout") || lower.includes("yoga")) {
    return Dumbbell;
  }

  // Outdoor & Views
  if (lower.includes("garden") || lower.includes("lawn") || lower.includes("courtyard") || lower.includes("nature") || lower.includes("tree")) {
    return Trees;
  }
  if (lower.includes("balcony") || lower.includes("terrace") || lower.includes("deck") || lower.includes("patio") || lower.includes("sun")) {
    return Sun;
  }
  if (lower.includes("view") || lower.includes("scenic") || lower.includes("lake") || lower.includes("mountain") || lower.includes("sunset") || lower.includes("sunrise")) {
    return Mountain;
  }

  // Service & Security
  if (lower.includes("butler") || lower.includes("housekeeping") || lower.includes("room service") || lower.includes("service") || lower.includes("concierge")) {
    return BellRing;
  }
  if (lower.includes("security") || lower.includes("cctv") || lower.includes("guard") || lower.includes("safe") || lower.includes("locker")) {
    return ShieldCheck;
  }
  if (lower.includes("power") || lower.includes("backup") || lower.includes("generator") || lower.includes("electricity")) {
    return Zap;
  }
  if (lower.includes("desk") || lower.includes("workspace") || lower.includes("work")) {
    return Laptop;
  }
  if (lower.includes("pet")) {
    return PawPrint;
  }

  return Sparkles;
}

interface AmenityIconProps {
  name: string;
  className?: string;
  iconClassName?: string;
}

export function AmenityIcon({
  name,
  className = "inline-flex items-center justify-center",
  iconClassName = "w-4 h-4 text-[#202020] dark:text-[#FCFBF8]",
}: AmenityIconProps) {
  const IconComponent = getAmenityLucideIcon(name);
  return (
    <span className={className} title={name}>
      {React.createElement(IconComponent, { className: iconClassName })}
    </span>
  );
}

// Curated standard presets for Admin amenities picker
export const STANDARD_LUXURY_AMENITIES = [
  "High-Speed Wi-Fi",
  "Air Conditioning",
  "Private Infinity Pool",
  "Private Parking",
  "Gourmet Kitchen",
  "Smart TV & Sound System",
  "Daily Butler & Housekeeping",
  "Hot Water & Luxury Bath",
  "100% Power Backup",
  "Private Garden & Lawn",
  "Panoramic Lake / Mountain View",
  "Balcony & Sun Deck",
  "Washing Machine & Laundry",
  "Refrigerator & Microwave",
  "Espresso Coffee Bar",
  "24/7 Security & Concierge",
  "Dedicated Workspace",
  "Dining Pavilion & BBQ",
];
