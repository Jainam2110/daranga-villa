import React from "react";
import {
  Wifi,
  Snowflake,
  Waves,
  Car,
  UtensilsCrossed,
  Utensils,
  Tv,
  Shirt,
  Flame,
  Trees,
  Sun,
  Sparkles,
  Droplets,
  Zap,
  Eye,
  ShieldCheck,
  Bath,
  Dumbbell,
  Speaker,
  Coffee,
  PawPrint,
  Laptop,
  Refrigerator,
  Microwave,
  Fan,
} from "lucide-react";

interface AmenityIconProps {
  name: string;
  className?: string;
}

export function AmenityIcon({ name, className = "w-4 h-4 text-[var(--accent)]" }: AmenityIconProps) {
  const lower = (name || "").toLowerCase().trim();

  // Pool & Water
  if (lower.includes("pool") || lower.includes("swim") || lower.includes("jacuzzi") || lower.includes("hot tub")) {
    return <Waves className={className} aria-hidden="true" />;
  }

  // Climate / AC
  if (lower.includes("ac") || lower.includes("air condition") || lower.includes("climate") || lower.includes("cooling")) {
    return <Snowflake className={className} aria-hidden="true" />;
  }
  if (lower.includes("fan") || lower.includes("ventilation")) {
    return <Fan className={className} aria-hidden="true" />;
  }
  if (lower.includes("heater") || lower.includes("heating") || lower.includes("fireplace") || lower.includes("bonfire")) {
    return <Flame className={className} aria-hidden="true" />;
  }

  // Internet & Connectivity
  if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("internet") || lower.includes("broadband") || lower.includes("fiber")) {
    return <Wifi className={className} aria-hidden="true" />;
  }

  // Parking & Transport
  if (lower.includes("parking") || lower.includes("car") || lower.includes("valet") || lower.includes("garage") || lower.includes("ev charge")) {
    return <Car className={className} aria-hidden="true" />;
  }

  // Kitchen & Dining
  if (lower.includes("kitchen") || lower.includes("cook") || lower.includes("chef") || lower.includes("culinary")) {
    return <UtensilsCrossed className={className} aria-hidden="true" />;
  }
  if (lower.includes("dining") || lower.includes("breakfast") || lower.includes("meal") || lower.includes("restaurant") || lower.includes("barbecue") || lower.includes("bbq")) {
    return <Utensils className={className} aria-hidden="true" />;
  }
  if (lower.includes("fridge") || lower.includes("refrigerator")) {
    return <Refrigerator className={className} aria-hidden="true" />;
  }
  if (lower.includes("microwave") || lower.includes("oven")) {
    return <Microwave className={className} aria-hidden="true" />;
  }
  if (lower.includes("coffee") || lower.includes("espresso") || lower.includes("tea") || lower.includes("bar")) {
    return <Coffee className={className} aria-hidden="true" />;
  }

  // Entertainment
  if (lower.includes("tv") || lower.includes("television") || lower.includes("netflix") || lower.includes("cinema") || lower.includes("theater")) {
    return <Tv className={className} aria-hidden="true" />;
  }
  if (lower.includes("sound") || lower.includes("speaker") || lower.includes("audio") || lower.includes("music")) {
    return <Speaker className={className} aria-hidden="true" />;
  }

  // Laundry
  if (lower.includes("washing") || lower.includes("laundry") || lower.includes("dryer") || lower.includes("iron")) {
    return <Shirt className={className} aria-hidden="true" />;
  }

  // Bathroom & Wellness
  if (lower.includes("hot water") || lower.includes("geyser") || lower.includes("shower") || lower.includes("water purifier")) {
    return <Droplets className={className} aria-hidden="true" />;
  }
  if (lower.includes("bath") || lower.includes("spa") || lower.includes("tub") || lower.includes("toiletries")) {
    return <Bath className={className} aria-hidden="true" />;
  }
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout") || lower.includes("yoga")) {
    return <Dumbbell className={className} aria-hidden="true" />;
  }

  // Outdoor & Views
  if (lower.includes("garden") || lower.includes("lawn") || lower.includes("courtyard") || lower.includes("nature") || lower.includes("tree")) {
    return <Trees className={className} aria-hidden="true" />;
  }
  if (lower.includes("balcony") || lower.includes("terrace") || lower.includes("deck") || lower.includes("patio") || lower.includes("sun")) {
    return <Sun className={className} aria-hidden="true" />;
  }
  if (lower.includes("view") || lower.includes("scenic") || lower.includes("lake") || lower.includes("mountain") || lower.includes("sunset") || lower.includes("sunrise")) {
    return <Eye className={className} aria-hidden="true" />;
  }

  // Security & Service
  if (lower.includes("butler") || lower.includes("housekeeping") || lower.includes("room service") || lower.includes("service") || lower.includes("concierge")) {
    return <Sparkles className={className} aria-hidden="true" />;
  }
  if (lower.includes("security") || lower.includes("cctv") || lower.includes("guard") || lower.includes("safe") || lower.includes("locker")) {
    return <ShieldCheck className={className} aria-hidden="true" />;
  }
  if (lower.includes("power") || lower.includes("backup") || lower.includes("generator") || lower.includes("electricity")) {
    return <Zap className={className} aria-hidden="true" />;
  }
  if (lower.includes("desk") || lower.includes("workspace") || lower.includes("work")) {
    return <Laptop className={className} aria-hidden="true" />;
  }
  if (lower.includes("pet")) {
    return <PawPrint className={className} aria-hidden="true" />;
  }

  // Default Luxury Hospitality Icon
  return <Sparkles className={className} aria-hidden="true" />;
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
