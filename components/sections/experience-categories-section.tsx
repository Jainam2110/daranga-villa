"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { MapPin, X } from "lucide-react";
import { Container } from "@/components/ui/container";

export interface DestinationCategory {
  id: string;
  name: string;
  tagline: string;
  keywords: string[];
  iconType:
    | "lake"
    | "hills"
    | "palace"
    | "valley"
    | "nature"
    | "pool"
    | "sunset"
    | "heritage";
}

export const DESTINATION_CATEGORIES: DestinationCategory[] = [
  {
    id: "lake-pichola",
    name: "Lake Pichola",
    tagline: "Lakeside Sanctuaries",
    keywords: ["pichola", "lake", "lakeview", "water", "sunset"],
    iconType: "lake",
  },
  {
    id: "tiger-hills",
    name: "Tiger Hills",
    tagline: "Hillside Solitude",
    keywords: ["tiger", "hills", "mountain", "aravalli", "heights"],
    iconType: "hills",
  },
  {
    id: "fatehsagar",
    name: "Fateh Sagar",
    tagline: "Lake Promenade",
    keywords: ["fateh", "sagar", "lake", "waterfront", "walks"],
    iconType: "sunset",
  },
  {
    id: "aravalli-valleys",
    name: "Aravalli Hills",
    tagline: "Valley Panorama",
    keywords: ["aravalli", "valley", "hills", "nature", "peace"],
    iconType: "valley",
  },
  {
    id: "rayta-hills",
    name: "Rayta Hills",
    tagline: "Rolling Green Valleys",
    keywords: ["rayta", "hills", "nature", "clouds", "scenic"],
    iconType: "nature",
  },
  {
    id: "sajjangarh",
    name: "Monsoon Palace",
    tagline: "Royal Sunset Ridge",
    keywords: ["sajjangarh", "monsoon", "palace", "heritage", "view"],
    iconType: "palace",
  },
  {
    id: "private-pool",
    name: "Private Pool",
    tagline: "Exclusive Aquatic Stays",
    keywords: ["pool", "swimming", "private pool", "infinity"],
    iconType: "pool",
  },
  {
    id: "royal-heritage",
    name: "Royal Heritage",
    tagline: "Mewari Grandeur",
    keywords: ["heritage", "royal", "mewari", "architecture", "suite"],
    iconType: "heritage",
  },
];

// Backward-compatible alias
export const EXPERIENCE_CATEGORIES = DESTINATION_CATEGORIES;

interface ExperienceCategoriesSectionProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  className?: string;
}

// Illustrated Vector Icons: clean black line work with subtle blush (#F6C7CA / #EFA1AA), soft peach (#F6D2B8), and pastel blue (#DDEEFF)
function DestinationLineIcon({ type }: { type: DestinationCategory["iconType"] }) {
  switch (type) {
    case "lake":
      // Lake sunrise with sailboat and waves
      return (
        <svg viewBox="0 0 56 56" className="w-10 h-10 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle blush & peach backdrop blobs */}
          <circle cx="28" cy="22" r="10" fill="#F6D2B8" opacity="0.8" />
          <path d="M12 36C18 33 24 37 30 35C36 33 42 37 46 35" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 42C16 39 22 43 28 41C34 39 40 43 46 41" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          {/* Sailboat */}
          <path d="M28 14V30M28 16L38 28H28" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 30H36L33 34H23L20 30Z" fill="#F6C7CA" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "hills":
      // Mountain peaks with birds and soft blush accent
      return (
        <svg viewBox="0 0 56 56" className="w-10 h-10 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 18L44 40H16L30 18Z" fill="#F6C7CA" opacity="0.65" />
          <circle cx="38" cy="18" r="6" fill="#F6D2B8" opacity="0.9" />
          {/* Mountain linework */}
          <path d="M8 44L24 16L36 34L42 24L50 44H8Z" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 16L29 26L24 30L20 25L24 16Z" fill="#DDEEFF" />
          {/* Flying birds */}
          <path d="M14 16C16 14 18 16 20 14" stroke="#202020" className="dark:stroke-white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "sunset":
      // Lakeside Sunset with reflection
      return (
        <svg viewBox="0 0 56 56" className="w-10 h-10 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="28" cy="24" rx="12" ry="12" fill="#F6C7CA" opacity="0.8" />
          <circle cx="28" cy="20" r="7" fill="#F6D2B8" />
          <path d="M8 36H48" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 42H44" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18 48H38" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "valley":
      // Valley with road and mountain peaks
      return (
        <svg viewBox="0 0 56 56" className="w-10 h-10 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="26" y="10" width="16" height="24" rx="4" fill="#F6D2B8" opacity="0.75" />
          <path d="M10 44L22 20L34 38L42 26L48 44H10Z" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Valley winding road */}
          <path d="M26 44C26 38 30 36 28 30" stroke="#EFA1AA" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "nature":
      // Palm tree / tropical beach / lake oasis
      return (
        <svg viewBox="0 0 56 56" className="w-10 h-10 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="34" cy="22" r="9" fill="#F6D2B8" opacity="0.85" />
          <ellipse cx="28" cy="44" rx="18" ry="4" fill="#DDEEFF" />
          {/* Palm trunk */}
          <path d="M24 44C25 36 29 28 29 20" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          {/* Palm leaves */}
          <path d="M29 20C25 18 18 20 16 26" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M29 20C29 14 26 8 20 10" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M29 20C33 14 39 12 42 16" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M29 20C35 20 40 24 42 29" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "palace":
      // Mewari heritage royal arch / palace dome
      return (
        <svg viewBox="0 0 56 56" className="w-10 h-10 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M28 8C23 13 18 16 18 24H38C38 16 33 13 28 8Z" fill="#F6C7CA" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="28" cy="7" r="1.5" fill="#202020" className="dark:fill-white" />
          <path d="M14 24V46H42V24" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 46V32C22 28.5 25 26 28 26C31 26 34 28.5 34 32V46" fill="#FBE9DC" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" />
        </svg>
      );
    case "pool":
      // Swimming pool lounger with umbrella
      return (
        <svg viewBox="0 0 56 56" className="w-10 h-10 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="22" r="8" fill="#F6D2B8" opacity="0.85" />
          {/* Waves */}
          <path d="M8 40C12 38 16 42 20 40C24 38 28 42 32 40C36 38 40 42 44 40" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 46C16 44 20 48 24 46C28 44 32 48 36 46C40 44 44 48 48 46" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          {/* Umbrella */}
          <path d="M24 16C24 16 28 10 34 10C40 10 44 16 44 16H24Z" fill="#F6C7CA" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M34 10V28" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "heritage":
      // Traditional Mewari pavilion
      return (
        <svg viewBox="0 0 56 56" className="w-10 h-10 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="38" cy="20" r="7" fill="#DDEEFF" />
          <path d="M12 24L28 10L44 24H12Z" fill="#F6D2B8" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M16 24V44M40 24V44M28 24V44" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 44H46" stroke="#202020" className="dark:stroke-white" strokeWidth="1.8" strokeLinecap="round" />
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
  const [scrollProgress, setScrollProgress] = useState(0);

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
    const el = document.getElementById("villas");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className={`pt-6 pb-4 sm:py-6 bg-transparent text-[#202020] dark:text-white select-none ${className}`}>
      <Container>
        {/* Section Heading: Editorial Serif + Modern Sans link (matches reference screenshot) */}
        <div className="flex flex-row items-baseline justify-between gap-2 mb-3 sm:mb-4 px-1">
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-normal text-[#202020] dark:text-white tracking-tight">
              Pick a Destination
            </h2>
            <div className="flex items-center gap-1 text-xs text-[#202020] dark:text-stone-300 font-sans font-medium hover:underline cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-[#202020] dark:text-white" />
              <span>Show nearby locations</span>
            </div>
          </div>
        </div>

        {/* Active Filter Notification Bar if selected */}
        {selectedCategory && (
          <div className="mb-3 flex items-center justify-between p-2.5 sm:p-3 rounded-[12px] bg-[#F2F7FC] dark:bg-[#202020] border border-[#DDEEFF] dark:border-[#383838] text-xs text-[#202020] dark:text-white animate-in fade-in">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#EFA1AA]" />
              Showing properties in:{" "}
              <strong className="text-[#202020] dark:text-white font-semibold">
                {DESTINATION_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-[#555555] dark:text-[#BDBDBD] hover:text-[#C94A4A] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Desktop Destination Row & Mobile Horizontal Swipe Carousel */}
        <div
          ref={scrollRef}
          className="
            overflow-x-auto
            scrollbar-none
            scroll-touch-pan
            pb-2
            -mx-4 px-4 sm:mx-0 sm:px-0
          "
        >
          <div className="grid grid-rows-2 grid-flow-col auto-cols-[80px] sm:auto-cols-[100px] lg:grid-rows-1 lg:grid-cols-8 gap-2.5 sm:gap-3 w-max lg:w-full">
            {DESTINATION_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  aria-pressed={isSelected}
                  className={`
                    group flex flex-col items-center text-center p-2 rounded-[14px] transition-all duration-200 cursor-pointer
                    ${
                      isSelected
                        ? "bg-white dark:bg-[#202020] ring-1.5 ring-[#202020] dark:ring-white shadow-xs"
                        : "hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                    }
                  `}
                >
                  {/* Lightweight Line-art Icon Container */}
                  <div
                    className={`
                      relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105
                      ${
                        isSelected
                          ? "bg-[#DDEEFF] dark:bg-[#383838]"
                          : "bg-transparent"
                      }
                    `}
                  >
                    <DestinationLineIcon type={cat.iconType} />
                  </div>

                  {/* Destination Name Label */}
                  <span
                    className={`
                      mt-1.5 text-[11px] sm:text-xs font-sans tracking-tight line-clamp-1
                      ${
                        isSelected
                          ? "text-[#202020] dark:text-white font-semibold"
                          : "text-[#555555] dark:text-[#BDBDBD] group-hover:text-[#202020] dark:group-hover:text-white font-normal"
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

        {/* Scroll Progress Bar for Mobile */}
        <div className="flex lg:hidden justify-center items-center pt-1.5">
          <div className="w-12 h-0.5 bg-[#E8E8E8] dark:bg-[#383838] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#202020] dark:bg-white rounded-full transition-all duration-150"
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
