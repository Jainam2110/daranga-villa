"use client";

import React from "react";
import { Container } from "@/components/ui/container";
import { Sparkles, Award, Home } from "lucide-react";

interface PartnerFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function CuratedStaysIcon() {
  return (
    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white text-black dark:bg-[#171717] dark:text-white flex items-center justify-center shadow-md flex-shrink-0 border border-stone-200 dark:border-stone-800 transition-transform group-hover:scale-105">
      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white stroke-[1.8]" />
    </div>
  );
}

function UnmatchedServiceIcon() {
  return (
    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white text-black dark:bg-[#171717] dark:text-white flex items-center justify-center shadow-md flex-shrink-0 border border-stone-200 dark:border-stone-800 transition-transform group-hover:scale-105">
      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white stroke-[1.8]" />
    </div>
  );
}

function ImpeccableVillasIcon() {
  return (
    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white text-black dark:bg-[#171717] dark:text-white flex items-center justify-center shadow-md flex-shrink-0 border border-stone-200 dark:border-stone-800 transition-transform group-hover:scale-105">
      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white stroke-[1.8]" />
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
