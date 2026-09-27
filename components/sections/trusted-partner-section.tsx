"use client";

import React from "react";
import { Container } from "@/components/ui/container";

interface PartnerFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function CuratedStaysIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF5F2] via-[#FEECEB] to-[#FDF4E7] dark:from-[#2A2422] dark:to-[#222] flex items-center justify-center p-2.5 shadow-xs flex-shrink-0 border border-[#F5D0B5]/40 dark:border-[#52443C]/40">
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="18" r="3.5" fill="#E8A0A8" />
        <path
          d="M16 40C16 29 23.2 21 32 21C40.8 21 48 29 48 40H16Z"
          fill="url(#dome-grad)"
        />
        <path
          d="M10 42C10 40.5 14 39.5 32 39.5C50 39.5 54 40.5 54 42C54 44 48 45.5 32 45.5C16 45.5 10 44 10 42Z"
          fill="url(#plate-grad)"
        />
        <path
          d="M8 48C14 48 18 46 26 46H38C44 46 50 49 56 49"
          stroke="#E8A0A8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="dome-grad" x1="16" y1="21" x2="48" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCE7E8" />
            <stop offset="0.6" stopColor="#F6C7CA" />
            <stop offset="1" stopColor="#F6D2B8" />
          </linearGradient>
          <linearGradient id="plate-grad" x1="10" y1="39.5" x2="54" y2="45.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EFA1AA" />
            <stop offset="1" stopColor="#F6D2B8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function UnmatchedServiceIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FCFBF9] via-[#FCE7E8] to-[#FBE9DC] dark:from-[#2A2422] dark:to-[#222] flex items-center justify-center p-2.5 shadow-xs flex-shrink-0 border border-[#F6D2B8]/40 dark:border-[#52443C]/40">
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="27" r="15" fill="url(#rosette-grad)" />
        <path
          d="M25 27L29.5 31.5L39 22"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26 39L22 51L32 46L42 51L38 39"
          fill="url(#ribbon-grad)"
        />
        {/* Sparkle */}
        <path
          d="M47 13L48.5 9.5L52 8L48.5 6.5L47 3L45.5 6.5L42 8L45.5 9.5L47 13Z"
          fill="#EFA1AA"
        />
        <defs>
          <linearGradient id="rosette-grad" x1="17" y1="12" x2="47" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F6C7CA" />
            <stop offset="0.5" stopColor="#EFA1AA" />
            <stop offset="1" stopColor="#F6D2B8" />
          </linearGradient>
          <linearGradient id="ribbon-grad" x1="22" y1="39" x2="42" y2="51" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EFA1AA" />
            <stop offset="1" stopColor="#F6D2B8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function ImpeccableVillasIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FCFBF9] via-[#FCE7E8] to-[#FBE9DC] dark:from-[#2A2422] dark:to-[#222] flex items-center justify-center p-2.5 shadow-xs flex-shrink-0 border border-[#F6D2B8]/40 dark:border-[#52443C]/40">
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 29L32 15L48 29V49H16V29Z"
          fill="url(#house-grad)"
        />
        <path d="M38 18V13H42V21.5" fill="#EFA1AA" />
        <rect x="25.5" y="34" width="13" height="15" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
        <rect x="20" y="32" width="4" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.8" />
        {/* Sparkles */}
        <path
          d="M48 11L49.5 8L52.5 6.5L49.5 5L48 2L46.5 5L43.5 6.5L46.5 8L48 11Z"
          fill="#F6D2B8"
        />
        <path
          d="M12 21L13 19L15 18L13 17L12 15L11 17L9 18L11 19L12 21Z"
          fill="#EFA1AA"
        />
        <defs>
          <linearGradient id="house-grad" x1="16" y1="15" x2="48" y2="49" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCE7E8" />
            <stop offset="0.5" stopColor="#F6D2B8" />
            <stop offset="1" stopColor="#EFA1AA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

const PARTNER_FEATURES: PartnerFeature[] = [
  {
    id: "curated-stays",
    title: "Curated Stays",
    description: "Only the best villas, handpicked for you",
    icon: <CuratedStaysIcon />,
  },
  {
    id: "unmatched-service",
    title: "Unmatched Service",
    description: "Dedicated concierge & travel assistance",
    icon: <UnmatchedServiceIcon />,
  },
  {
    id: "impeccable-villas",
    title: "Impeccable Villas",
    description: "Clean, safe, and quality-checked stays",
    icon: <ImpeccableVillasIcon />,
  },
];

export function TrustedPartnerSection() {
  return (
    <section className="py-8 sm:py-12 bg-transparent select-none">
      <Container>
        {/* Title Header with Sparkle Accent */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#202020] dark:text-white tracking-tight">
            Your Trusted Getaway Partner
          </h2>
          <span className="text-[#EFA1AA] text-xl sm:text-2xl animate-pulse">✨</span>
        </div>

        {/* 3 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {PARTNER_FEATURES.map((item) => (
            <div
              key={item.id}
              className="group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-[0_4px_20px_rgba(32,32,32,0.04)] hover:shadow-[0_10px_30px_rgba(32,32,32,0.08)] transition-all duration-300 hover:-translate-y-0.5"
            >
              {item.icon}
              <div className="flex-1 min-w-0 space-y-0.5">
                <h3 className="font-sans font-semibold text-sm sm:text-base text-[#202020] dark:text-white tracking-tight transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#555555] dark:text-[#BDBDBD] font-light leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
