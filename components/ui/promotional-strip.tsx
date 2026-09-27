"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface PromotionalStripProps {
  message?: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export function PromotionalStrip({
  message = "Direct Booking Privilege • Complimentary artisanal breakfast & bespoke concierge hospitality with every stay",
  ctaText = "Explore Villas",
  ctaHref = "/villas",
  className = "",
}: PromotionalStripProps) {
  return (
    <aside
      aria-label="Promotional Announcement"
      className={`w-full py-2.5 px-4 text-center text-[#202020] text-xs font-medium tracking-wide flex items-center justify-center gap-2 sm:gap-3 transition-all ${className}`}
      style={{
        background: "linear-gradient(90deg, #F6C7CA 0%, #F6D2B8 100%)",
        color: "#202020",
      }}
    >
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Sparkles className="w-3.5 h-3.5 text-[#202020] flex-shrink-0" />
        <span className="font-sans font-medium text-[11px] sm:text-xs">
          {message}
        </span>
        {ctaText && (
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] underline hover:opacity-80 transition-opacity ml-1"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </aside>
  );
}
