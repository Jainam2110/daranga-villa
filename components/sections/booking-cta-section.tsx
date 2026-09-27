"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

interface BookingCtaSectionProps {
  onCheckAvailabilityClick?: () => void;
}

export function BookingCtaSection({
  onCheckAvailabilityClick,
}: BookingCtaSectionProps) {
  return (
    <section className="relative py-24 lg:py-32 bg-[#FCFBF8] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] overflow-hidden border-t border-[#E8E6E2] dark:border-[#383633]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/heroimg.webp"
          alt="Daranga Villa Escape"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-20 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FCFBF8] via-[#FCFBF8]/80 to-[#FCFBF8]/60 dark:from-[#171717] dark:via-[#171717]/80 dark:to-[#171717]/60" />
      </div>

      <Container className="relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B99A62]">
              RESERVE YOUR SANCTUARY
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#202020] dark:text-[#FCFBF8] leading-[1.1]">
            Your sanctuary awaits.
          </h2>
          <p className="text-[#66635F] dark:text-[#BDB8B0] text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            Choose your private estate residence and make your next stay unforgettable with our 24/7 dedicated concierge hospitality.
          </p>
          <div className="pt-4">
            {onCheckAvailabilityClick ? (
              <button
                type="button"
                onClick={onCheckAvailabilityClick}
                className="px-8 py-4 bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF8] dark:text-[#202020] dark:hover:bg-white text-xs uppercase tracking-[0.25em] font-bold transition-all duration-300 shadow-md rounded-[6px] hover:scale-105 active:scale-95"
              >
                EXPLORE &amp; RESERVE VILLAS
              </button>
            ) : (
              <Link
                href="/villas"
                className="inline-block px-8 py-4 bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF8] dark:text-[#202020] dark:hover:bg-white text-xs uppercase tracking-[0.25em] font-bold transition-all duration-300 shadow-md rounded-[6px] hover:scale-105 active:scale-95"
              >
                EXPLORE &amp; RESERVE VILLAS
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
