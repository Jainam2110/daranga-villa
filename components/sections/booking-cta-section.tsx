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
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white dark:bg-[#171717] text-[#202020] dark:text-white overflow-hidden border-t border-[#E8E8E8] dark:border-[#383838]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/heroimg.webp"
          alt="Daranga Villa Escape"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-15 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/60 dark:from-[#171717] dark:via-[#171717]/85 dark:to-[#171717]/60" />
      </div>

      <Container className="relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#202020] dark:text-white">
              RESERVE YOUR SANCTUARY
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#202020] dark:text-white leading-[1.1]">
            Your sanctuary awaits.
          </h2>
          <p className="text-[#555555] dark:text-[#BDBDBD] text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            Choose your private estate residence and make your next stay unforgettable with our 24/7 dedicated concierge hospitality.
          </p>
          <div className="pt-4">
            {onCheckAvailabilityClick ? (
              <button
                type="button"
                onClick={onCheckAvailabilityClick}
                className="px-8 py-3.5 bg-[#202020] hover:bg-[#171717] text-white dark:bg-white dark:text-[#202020] dark:hover:bg-stone-200 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-xs rounded-full hover:scale-105 active:scale-95 cursor-pointer"
              >
                EXPLORE &amp; RESERVE VILLAS
              </button>
            ) : (
              <Link
                href="/villas"
                className="inline-block px-8 py-3.5 bg-[#202020] hover:bg-[#171717] text-white dark:bg-white dark:text-[#202020] dark:hover:bg-stone-200 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-xs rounded-full hover:scale-105 active:scale-95 cursor-pointer"
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
