import React from "react";

export function getAmenityEmoji(name: string): string {
  const lower = (name || "").toLowerCase().trim();

  // Pool & Water
  if (lower.includes("pool") || lower.includes("swim") || lower.includes("jacuzzi") || lower.includes("hot tub")) {
    return "🏊‍♂️";
  }

  // Climate / AC
  if (lower.includes("ac") || lower.includes("air condition") || lower.includes("climate") || lower.includes("cooling")) {
    return "❄️";
  }
  if (lower.includes("fan") || lower.includes("ventilation")) {
    return "💨";
  }
  if (lower.includes("heater") || lower.includes("heating") || lower.includes("fireplace") || lower.includes("bonfire")) {
    return "🔥";
  }

  // Internet & Connectivity
  if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("internet") || lower.includes("broadband") || lower.includes("fiber")) {
    return "📶";
  }

  // Parking & Transport
  if (lower.includes("parking") || lower.includes("car") || lower.includes("valet") || lower.includes("garage") || lower.includes("ev charge")) {
    return "🚗";
  }

  // Kitchen & Dining
  if (lower.includes("kitchen") || lower.includes("cook") || lower.includes("chef") || lower.includes("culinary")) {
    return "🍳";
  }
  if (lower.includes("dining") || lower.includes("breakfast") || lower.includes("meal") || lower.includes("restaurant") || lower.includes("barbecue") || lower.includes("bbq")) {
    return "🍽️";
  }
  if (lower.includes("fridge") || lower.includes("refrigerator")) {
    return "🧊";
  }
  if (lower.includes("microwave") || lower.includes("oven")) {
    return "♨️";
  }
  if (lower.includes("coffee") || lower.includes("espresso") || lower.includes("tea") || lower.includes("bar")) {
    return "☕";
  }

  // Entertainment
  if (lower.includes("tv") || lower.includes("television") || lower.includes("netflix") || lower.includes("cinema") || lower.includes("theater")) {
    return "📺";
  }
  if (lower.includes("sound") || lower.includes("speaker") || lower.includes("audio") || lower.includes("music")) {
    return "🔊";
  }

  // Laundry
  if (lower.includes("washing") || lower.includes("laundry") || lower.includes("dryer") || lower.includes("iron")) {
    return "🧺";
  }

  // Bathroom & Wellness
  if (lower.includes("hot water") || lower.includes("geyser") || lower.includes("shower") || lower.includes("water purifier")) {
    return "🚿";
  }
  if (lower.includes("bath") || lower.includes("spa") || lower.includes("tub") || lower.includes("toiletries")) {
    return "🛁";
  }
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout") || lower.includes("yoga")) {
    return "🧘";
  }

  // Outdoor & Views
  if (lower.includes("garden") || lower.includes("lawn") || lower.includes("courtyard") || lower.includes("nature") || lower.includes("tree")) {
    return "🌿";
  }
  if (lower.includes("balcony") || lower.includes("terrace") || lower.includes("deck") || lower.includes("patio") || lower.includes("sun")) {
    return "🌅";
  }
  if (lower.includes("view") || lower.includes("scenic") || lower.includes("lake") || lower.includes("mountain") || lower.includes("sunset") || lower.includes("sunrise")) {
    return "🌄";
  }

  // Security & Service
  if (lower.includes("butler") || lower.includes("housekeeping") || lower.includes("room service") || lower.includes("service") || lower.includes("concierge")) {
    return "🛎️";
  }
  if (lower.includes("security") || lower.includes("cctv") || lower.includes("guard") || lower.includes("safe") || lower.includes("locker")) {
    return "🛡️";
  }
  if (lower.includes("power") || lower.includes("backup") || lower.includes("generator") || lower.includes("electricity")) {
    return "⚡";
  }
  if (lower.includes("desk") || lower.includes("workspace") || lower.includes("work")) {
    return "💻";
  }
  if (lower.includes("pet")) {
    return "🐾";
  }

  // Default Luxury Hospitality Real Emoji
  return "✨";
}

interface AmenityIconProps {
  name: string;
  className?: string;
}

export function AmenityIcon({ name, className = "text-base inline-flex items-center justify-center leading-none" }: AmenityIconProps) {
  const emoji = getAmenityEmoji(name);
  return (
    <span role="img" aria-label={name} className={`select-none ${className}`}>
      {emoji}
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

