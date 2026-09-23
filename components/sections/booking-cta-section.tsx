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
    <section className="relative py-28 lg:py-36 bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden border-t border-[var(--border-color)]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/heroimg.webp"
          alt="Daranga Villa Escape"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-30 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)]/60" />
      </div>

      {/* Ambient Radial Golden Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--accent)]/10 blur-[100px] pointer-events-none animate-ambient-glow" />

      <Container className="relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="animate-float-slow">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
              RESERVE YOUR SANCTUARY
            </span>
          </div>
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[var(--text-primary)] leading-[1.1]">
            Your sanctuary awaits.
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            Choose your private estate residence and make your next stay unforgettable with our 24/7 dedicated concierge hospitality.
          </p>
          <div className="pt-4">
            {onCheckAvailabilityClick ? (
              <button
                type="button"
                onClick={onCheckAvailabilityClick}
                className="btn-luxury-shimmer px-9 py-4 bg-[var(--accent)] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-[0.25em] font-bold transition-all duration-300 shadow-2xl rounded-[6px] hover:scale-105 active:scale-95"
              >
                EXPLORE &amp; RESERVE VILLAS
              </button>
            ) : (
              <Link
                href="/villas"
                className="btn-luxury-shimmer inline-block px-9 py-4 bg-[var(--accent)] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-[0.25em] font-bold transition-all duration-300 shadow-2xl rounded-[6px] hover:scale-105 active:scale-95"
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
