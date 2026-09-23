"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { VillaCardsCarousel } from "@/components/ui/villa-cards-carousel";
import { Villa } from "@/types/villa";
import { getAllVillaImageUrls } from "@/lib/utils/image";

interface FeaturedVillasSectionProps {
  villas: Villa[];
  onSelectVilla?: (villaId: string) => void;
}

function FeaturedVillaHeroCard({
  villa,
  images,
  onSelectVilla,
}: {
  villa: Villa;
  images: string[];
  onSelectVilla?: (villaId: string) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx(idx);
  };

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0) {
        setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else {
        setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="group/hero relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] overflow-hidden grid grid-cols-12 shadow-2xl card-luxury-hover hover:border-[var(--accent)]/50 transition-all duration-700">
      {/* 7-Col Image Gallery / Slider */}
      <div
        className="col-span-7 relative w-full min-h-[500px] bg-[var(--bg-primary)] overflow-hidden block select-none group/img"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={`/villas/${villa.slug || villa.id}`}
          onClick={() => onSelectVilla?.(villa.id)}
          className="absolute inset-0 block w-full h-full"
          aria-label={`View details for ${villa.name}`}
        >
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                idx === currentIdx ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <Image
                src={imgUrl}
                alt={`${villa.name} photo ${idx + 1}`}
                fill
                sizes="60vw"
                className="object-cover transition-transform duration-1000 group-hover/hero:scale-105"
                priority={idx === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/hero:opacity-30 transition-opacity duration-500 z-10" />
        </Link>

        {/* Flagship Badge */}
        <div className="absolute top-6 left-6 z-20 pointer-events-none">
          <span className="px-3.5 py-1.5 bg-[var(--bg-primary)]/90 text-[var(--accent)] text-[10px] uppercase tracking-[0.25em] font-semibold border border-[var(--accent)]/30 backdrop-blur-md rounded-[4px] shadow-sm">
            Flagship Residence
          </span>
        </div>

        {/* Image Controls & Indicator */}
        {images.length > 1 && (
          <>
            {/* Image Counter Badge */}
            <div className="absolute top-6 right-6 z-20 pointer-events-none">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-stone-200 text-xs font-mono tracking-wider font-medium rounded-[4px] border border-white/10 shadow-sm">
                {currentIdx + 1} / {images.length}
              </span>
            </div>

            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] flex items-center justify-center transition-all duration-200 shadow-lg opacity-0 group-hover/img:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] flex items-center justify-center transition-all duration-200 shadow-lg opacity-0 group-hover/img:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIdx
                      ? "w-6 h-1.5 bg-[#C89B4A]"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 5-Col Details Section */}
      <div className="col-span-5 p-10 xl:p-12 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent)] font-semibold">
            {villa.location || "Daranga Sanctuary Estate"}
          </div>

          <Link href={`/villas/${villa.slug || villa.id}`} onClick={() => onSelectVilla?.(villa.id)}>
            <h3 className="font-serif text-3xl xl:text-4xl font-normal text-[var(--text-primary)] group-hover/hero:text-[var(--accent)] transition-colors">
              {villa.name}
            </h3>
          </Link>

          <p className="text-[var(--text-secondary)] text-sm font-light leading-relaxed">
            {villa.description || "An architectural masterpiece offering total privacy, expansive outdoor lounges, and panoramic views."}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--text-secondary)] py-3 border-y border-[var(--border-color)]">
            <span>{villa.maxGuests || 6} Guests</span>
            <span>•</span>
            <span>{villa.bedrooms || 3} Bedrooms</span>
            <span>•</span>
            <span>{villa.bathrooms || 3} Bathrooms</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between gap-4 border-t border-[var(--border-color)]">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] block font-medium">Starting Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-3xl font-bold text-[var(--text-primary)]">
                ₹{villa.pricePerNight.toLocaleString("en-IN")}
              </span>
              <span className="font-sans text-xs text-[var(--text-secondary)] font-normal">/ night</span>
            </div>
          </div>

          <Link
            href={`/villas/${villa.slug || villa.id}`}
            onClick={() => onSelectVilla?.(villa.id)}
            className="btn-luxury-shimmer text-center px-6 py-3.5 bg-[var(--accent)] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-[0.2em] font-bold transition-all rounded-[6px] shadow-lg hover:scale-105 active:scale-95"
          >
            EXPLORE VILLA &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FeaturedVillasSection({
  villas,
  onSelectVilla,
}: FeaturedVillasSectionProps) {
  const featuredVilla = villas[0];
  const supportingVillas = villas.slice(1);

  return (
    <section id="villas" className="py-24 lg:py-36 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[var(--border-color)] pb-8">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block">
              THE VILLAS
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Designed for the way<br />you want to live.
            </h2>
          </div>

          <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-light leading-relaxed max-w-md">
            Each villa offers secluded grounds, private infinity pools, and dedicated 24/7 personal hospitality.
          </p>
        </div>

        {/* Empty State */}
        {villas.length === 0 ? (
          <div className="p-16 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center max-w-xl mx-auto space-y-4">
            <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
              No Active Villa Residences Found
            </h3>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-light">
              Our private estate collection is currently being updated. Please check back shortly.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/villas"
                className="px-6 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] text-xs uppercase tracking-[0.2em] font-bold inline-block rounded-[6px]"
              >
                Manage Villas
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Mobile View (< lg): All Villas in clean 1-by-1 slide carousel */}
            <div className="block lg:hidden">
              <VillaCardsCarousel
                villas={villas}
                onViewClick={onSelectVilla}
              />
            </div>

            {/* Desktop View (lg+): Flagship Hero Showcase + Supporting Villas Grid */}
            <div className="hidden lg:block space-y-12">
              {featuredVilla && (() => {
                const featuredImages = getAllVillaImageUrls(featuredVilla.images, featuredVilla.imageUrl);
                return (
                  <FeaturedVillaHeroCard
                    villa={featuredVilla}
                    images={featuredImages}
                    onSelectVilla={onSelectVilla}
                  />
                );
              })()}

              {/* Supporting Villas Grid (Desktop) */}
              {supportingVillas.length > 0 && (
                <div className="pt-4">
                  <VillaCardsCarousel
                    villas={supportingVillas}
                    onViewClick={onSelectVilla}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

