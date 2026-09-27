"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { MapPin, Sparkles, X } from "lucide-react";
import { Container } from "@/components/ui/container";

export interface ExperienceCategory {
  id: string;
  name: string;
  tagline: string;
  keywords: string[];
  iconType:
    | "pool"
    | "heritage"
    | "lakeview"
    | "dining"
    | "nature"
    | "celebrations"
    | "pet"
    | "jacuzzi";
}

export const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  {
    id: "pool",
    name: "Private Pool",
    tagline: "Exclusive Dip & Deck",
    keywords: ["pool", "swimming", "private pool", "infinity"],
    iconType: "pool",
  },
  {
    id: "heritage",
    name: "Royal Heritage",
    tagline: "Mewari Architecture",
    keywords: ["heritage", "royal", "palace", "luxury", "suite"],
    iconType: "heritage",
  },
  {
    id: "lakeview",
    name: "Lake & Sunset",
    tagline: "Golden Hour Lounges",
    keywords: ["lake", "sunset", "view", "balcony", "lakeview"],
    iconType: "lakeview",
  },
  {
    id: "dining",
    name: "Private Chef",
    tagline: "Gourmet Dining & BBQ",
    keywords: ["chef", "dining", "breakfast", "food", "kitchen", "bbq"],
    iconType: "dining",
  },
  {
    id: "nature",
    name: "Aravalli Views",
    tagline: "Mountain & Valley",
    keywords: ["mountain", "aravalli", "hills", "nature", "valley", "garden"],
    iconType: "nature",
  },
  {
    id: "celebrations",
    name: "Celebrations",
    tagline: "Events & Lawns",
    keywords: ["lawn", "celebration", "party", "event", "gathering"],
    iconType: "celebrations",
  },
  {
    id: "pet",
    name: "Pet Friendly",
    tagline: "Lush Green Lawns",
    keywords: ["pet", "garden", "lawn", "sprawling"],
    iconType: "pet",
  },
  {
    id: "jacuzzi",
    name: "Spa & Jacuzzi",
    tagline: "Wellness Retreats",
    keywords: ["jacuzzi", "bath", "spa", "wellness", "luxury"],
    iconType: "jacuzzi",
  },
];

interface ExperienceCategoriesSectionProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  className?: string;
}

// Illustrated Vector Icons matching the Stay Vista whimsical / duotone pastel art style
function CategoryIllustratedIcon({ type }: { type: ExperienceCategory["iconType"] }) {
  switch (type) {
    case "pool":
      // Swimming pool with sun lounger & water waves
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="24" width="52" height="30" rx="8" className="fill-[#FEECEB] dark:fill-[#382828]" />
          <path d="M12 36C16 34 20 38 24 36C28 34 32 38 36 36C40 34 44 38 48 36C50 35 51 35.5 52 36" stroke="#E8A0A8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M12 44C16 42 20 46 24 44C28 42 32 46 36 44C40 42 44 46 48 44C50 43 51 43.5 52 44" stroke="#B99A62" strokeWidth="2" strokeLinecap="round" />
          {/* Parasol / Umbrella */}
          <path d="M22 10C22 10 26 14 34 14C42 14 46 10 46 10" stroke="#202020" className="dark:stroke-white" strokeWidth="2" strokeLinecap="round" />
          <path d="M34 10V24" stroke="#202020" className="dark:stroke-white" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 13C26 13 28 8 34 8C40 8 42 13 42 13" stroke="#E8A0A8" strokeWidth="2" strokeLinecap="round" fill="#FEECEB" />
        </svg>
      );
    case "heritage":
      // Mewari Jharokha / Royal Palace Dome
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8C26 14 20 18 20 26H44C44 18 38 14 32 8Z" className="fill-[#FDF2E2] dark:fill-[#383120]" stroke="#B99A62" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="32" cy="7" r="2" fill="#B99A62" />
          {/* Arch pillars */}
          <path d="M16 26V54H48V26" stroke="#202020" className="dark:stroke-white" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 54V38C24 33.5 27.5 30 32 30C36.5 30 40 33.5 40 38V54" stroke="#B99A62" strokeWidth="2" className="fill-[#FDF2E2] dark:fill-[#2A2315]" />
          <circle cx="32" cy="38" r="3" fill="#E8A0A8" />
        </svg>
      );
    case "lakeview":
      // Lake sunrise / sunset with reflection & sailboat
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="24" r="12" className="fill-[#FEECEB] dark:fill-[#3A2424]" stroke="#E8A0A8" strokeWidth="2" />
          <path d="M10 40C18 38 24 42 32 40C40 38 46 42 54 40" stroke="#202020" className="dark:stroke-white" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 48C20 46 26 50 32 48C38 46 44 50 50 48" stroke="#B99A62" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 20L48 34H38V20Z" className="fill-[#FDF2E2] dark:fill-[#383120]" stroke="#B99A62" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "dining":
      // Gourmet Cloche & Wine / Candlelight
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 42C14 26 22 20 32 20C42 20 50 26 50 42H14Z" className="fill-[#FEECEB] dark:fill-[#352525] dark:stroke-white" stroke="#202020" strokeWidth="2" />
          <circle cx="32" cy="17" r="3" fill="#B99A62" />
          <path d="M10 46H54" stroke="#B99A62" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 52H42" stroke="#202020" className="dark:stroke-white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="28" cy="32" r="2" fill="#E8A0A8" />
          <circle cx="36" cy="32" r="2" fill="#E8A0A8" />
        </svg>
      );
    case "nature":
      // Aravalli Mountain peaks with sun & bird
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="44" cy="18" r="6" className="fill-[#FEECEB] dark:fill-[#3A2424]" stroke="#E8A0A8" strokeWidth="1.5" />
          <path d="M8 50L26 20L38 38L46 26L56 50H8Z" className="fill-[#EBF4EC] dark:fill-[#1E2E20] dark:stroke-white" stroke="#202020" strokeWidth="2" strokeLinejoin="round" />
          <path d="M26 20L31 30L26 34L20 28L26 20Z" fill="#B99A62" opacity="0.6" />
          <path d="M14 16C16 14 18 16 20 14" stroke="#202020" className="dark:stroke-white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "celebrations":
      // Festive party tent / fairy lights / celebrations
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 48L32 14L52 48H12Z" className="fill-[#FDF2E2] dark:fill-[#383120] dark:stroke-white" stroke="#202020" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 14V48" stroke="#B99A62" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M24 48L32 32L40 48" stroke="#E8A0A8" strokeWidth="2" className="fill-[#FEECEB] dark:fill-[#352525]" />
          <circle cx="16" cy="18" r="2" fill="#B99A62" />
          <circle cx="48" cy="18" r="2.5" fill="#E8A0A8" />
          <circle cx="32" cy="10" r="2" fill="#B99A62" />
        </svg>
      );
    case "pet":
      // Sprawling garden paw & palm leaf
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="38" rx="12" ry="9" className="fill-[#FEECEB] dark:fill-[#352525] dark:stroke-white" stroke="#202020" strokeWidth="2" />
          <circle cx="19" cy="24" r="4.5" className="fill-[#FDF2E2] dark:fill-[#383120]" stroke="#B99A62" strokeWidth="2" />
          <circle cx="28" cy="18" r="4.5" className="fill-[#FDF2E2] dark:fill-[#383120]" stroke="#B99A62" strokeWidth="2" />
          <circle cx="36" cy="18" r="4.5" className="fill-[#FDF2E2] dark:fill-[#383120]" stroke="#B99A62" strokeWidth="2" />
          <circle cx="45" cy="24" r="4.5" className="fill-[#FDF2E2] dark:fill-[#383120]" stroke="#B99A62" strokeWidth="2" />
        </svg>
      );
    case "jacuzzi":
      // Steaming Jacuzzi / Spa Tub & Lotus
      return (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="30" width="44" height="24" rx="6" className="fill-[#FDF2E2] dark:fill-[#383120] dark:stroke-white" stroke="#202020" strokeWidth="2" />
          <path d="M16 38H48" stroke="#B99A62" strokeWidth="2" strokeLinecap="round" />
          {/* Steam curves */}
          <path d="M22 22C22 18 26 18 26 14" stroke="#E8A0A8" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 24C32 20 36 20 36 16" stroke="#B99A62" strokeWidth="2" strokeLinecap="round" />
          <path d="M42 22C42 18 46 18 46 14" stroke="#E8A0A8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function ExperienceCategoriesSection({
  selectedCategory,
  onSelectCategory,
  className = "",
}: ExperienceCategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(el.scrollLeft / maxScroll);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleCategoryClick = (id: string) => {
    const nextVal = selectedCategory === id ? null : id;
    onSelectCategory(nextVal);
    // Smooth scroll down to villas section
    const el = document.getElementById("villas");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className={`pt-6 pb-6 sm:py-8 bg-transparent text-[#202020] dark:text-[#FCFBF8] select-none ${className}`}>
      <Container>
        {/* Section Header with Location subtext (Matches the "Pick a Destination 📍 Show nearby locations" in reference) */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4 sm:mb-6 px-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#202020] dark:text-[#FCFBF8] tracking-tight">
              Explore by Experience
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#B99A62] font-medium tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-[#B99A62]" />
            <span>Udaipur, Rajasthan</span>
          </div>
        </div>

        {/* Active Filter Notification Bar if selected */}
        {selectedCategory && (
          <div className="mb-4 flex items-center justify-between p-3 rounded-[10px] bg-[#B99A62]/10 border border-[#B99A62]/30 text-xs text-[#202020] dark:text-[#FCFBF8] animate-in fade-in">
            <span className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-[#B99A62]" />
              Filtering by:{" "}
              <strong className="text-[#B99A62]">
                {EXPERIENCE_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-[#66635F] dark:text-[#BDB8B0] hover:text-rose-500 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Desktop Grid & Mobile Swipeable 2-Row Layout */}
        <div
          ref={scrollRef}
          className="
            overflow-x-auto
            scrollbar-none
            scroll-touch-pan
            pb-3
            -mx-4 px-4 sm:mx-0 sm:px-0
          "
        >
          {/* 
            Two-row layout on mobile/tablet (4 items per row, or 8 items flowing),
            Desktop: 8-item single grid or flexible wrapped cards
          */}
          <div className="grid grid-rows-2 grid-flow-col auto-cols-[82px] sm:auto-cols-[105px] lg:grid-rows-1 lg:grid-cols-8 gap-3 sm:gap-4 w-max lg:w-full">
            {EXPERIENCE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  aria-pressed={isSelected}
                  className={`
                    group flex flex-col items-center text-center p-2 sm:p-2.5 rounded-[12px] transition-all duration-300 cursor-pointer
                    ${
                      isSelected
                        ? "bg-white dark:bg-[#202020] ring-2 ring-[#B99A62] shadow-lg scale-105"
                        : "hover:bg-white/60 dark:hover:bg-[#202020]/60 active:scale-95"
                    }
                  `}
                >
                  {/* Illustrated Category Icon Container */}
                  <div
                    className={`
                      relative w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110
                      ${
                        isSelected
                          ? "bg-[#B99A62]/15 shadow-inner"
                          : "bg-[#F7F6F3] dark:bg-[#202020] border border-[#E8E6E2]/70 dark:border-[#383633]/70"
                      }
                    `}
                  >
                    <CategoryIllustratedIcon type={cat.iconType} />
                  </div>

                  {/* Category Name Label */}
                  <span
                    className={`
                      mt-2 text-[11px] sm:text-xs font-medium tracking-tight line-clamp-1
                      ${
                        isSelected
                          ? "text-[#B99A62] font-semibold"
                          : "text-[#202020] dark:text-[#FCFBF8] group-hover:text-[#B99A62]"
                      }
                    `}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sleek Scroll Progress Bar (Matches the two-segment pill in Stay Vista screenshot) */}
        <div className="flex lg:hidden justify-center items-center pt-2">
          <div className="w-16 h-1 bg-[#E8E6E2] dark:bg-[#383633] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B99A62] rounded-full transition-all duration-150"
              style={{
                width: "50%",
                transform: `translateX(${scrollProgress * 100}%)`,
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
