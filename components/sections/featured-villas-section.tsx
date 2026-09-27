import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Users, Bed, Bath, MapPin, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { VillaCardsCarousel } from "@/components/ui/villa-cards-carousel";
import { Villa } from "@/types/villa";
import { getAllVillaImageUrls } from "@/lib/utils/image";
import { getVillaAddress } from "@/lib/utils/villa-location";

interface FeaturedVillasSectionProps {
  villas: Villa[];
  onSelectVilla?: (villaId: string) => void;
  activeFilter?: string | null;
  onClearFilter?: () => void;
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
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx(idx);
  };

  // Smooth auto-slide effect (4.2s duration, pauses on hover or touch)
  useEffect(() => {
    if (images.length <= 1 || isHovered || isTouched) return;

    const timer = setTimeout(() => {
      setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, 4200);

    return () => clearTimeout(timer);
  }, [currentIdx, images.length, isHovered, isTouched]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchResumeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchResumeTimeout.current) clearTimeout(touchResumeTimeout.current);
    setIsTouched(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const diffX = touchStartX.current - e.changedTouches[0].clientX;
      const diffY = touchStartY.current - e.changedTouches[0].clientY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchResumeTimeout.current = setTimeout(() => {
      setIsTouched(false);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (touchResumeTimeout.current) clearTimeout(touchResumeTimeout.current);
    };
  }, []);

  return (
    <div
      className="group/hero relative bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] rounded-[8px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-md hover:shadow-xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 7-Col Image Gallery / Slider */}
      <div
        className="lg:col-span-7 relative w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] bg-[#F7F6F3] dark:bg-[#171717] overflow-hidden block select-none group/img"
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
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
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
          <span className="px-3.5 py-1.5 bg-white/95 dark:bg-[#202020]/95 text-[#B99A62] text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#B99A62]/30 backdrop-blur-md rounded-[4px] shadow-sm">
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
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#202020]/75 hover:bg-[#202020] text-white border border-white/20 flex items-center justify-center transition-all duration-200 shadow-lg opacity-0 group-hover/img:opacity-100 hover:scale-105 active:scale-95 focus:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#202020]/75 hover:bg-[#202020] text-white border border-white/20 flex items-center justify-center transition-all duration-200 shadow-lg opacity-0 group-hover/img:opacity-100 hover:scale-105 active:scale-95 focus:opacity-100"
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
                      ? "w-6 h-1.5 bg-[#B99A62]"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 5-Col Details Section */}
      <div className="lg:col-span-5 p-8 sm:p-10 xl:p-12 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#B99A62] font-semibold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{getVillaAddress(villa.location, "Daranga Sanctuary Estate")}</span>
          </div>

          <Link href={`/villas/${villa.slug || villa.id}`} onClick={() => onSelectVilla?.(villa.id)}>
            <h3 className="font-serif text-3xl xl:text-4xl font-normal text-[#202020] dark:text-[#FCFBF8] hover:text-[#B99A62] transition-colors">
              {villa.name}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#66635F] dark:text-[#BDB8B0] py-3 border-y border-[#E8E6E2] dark:border-[#383633]">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#B99A62]" />
              <span>{villa.maxGuests || 6} Guests</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-[#B99A62]" />
              <span>{villa.bedrooms || 3} BHK</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-[#B99A62]" />
              <span>{villa.bathrooms || 3} Baths</span>
            </span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between gap-4 border-t border-[#E8E6E2] dark:border-[#383633]">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[#66635F] dark:text-[#8A8782] block font-medium">Starting Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-3xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                ₹{villa.pricePerNight.toLocaleString("en-IN")}
              </span>
              <span className="font-sans text-xs text-[#66635F] dark:text-[#8A8782] font-normal">/ night</span>
            </div>
          </div>

          <Link
            href={`/villas/${villa.slug || villa.id}`}
            onClick={() => onSelectVilla?.(villa.id)}
            className="text-center px-6 py-3.5 bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF8] dark:text-[#202020] dark:hover:bg-white text-xs uppercase tracking-[0.2em] font-bold transition-all rounded-[6px] shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <span>EXPLORE VILLA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FeaturedVillasSection({
  villas,
  onSelectVilla,
  activeFilter,
  onClearFilter,
}: FeaturedVillasSectionProps) {
  const featuredVilla = villas[0];
  const supportingVillas = villas.slice(1);

  return (
    <section id="villas" className="pt-8 sm:pt-12 lg:py-24 bg-[#FCFBF8] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8]">
      <Container>
        {/* Section Header (Desktop only) */}
        <div className="hidden lg:flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6 border-b border-[#E8E6E2] dark:border-[#383633] pb-8">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B99A62] block">
              THE VILLAS
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#202020] dark:text-[#FCFBF8] tracking-tight leading-tight">
              Designed for the way<br />you want to live.
            </h2>
          </div>

          <div className="space-y-3 text-right">
            <p className="text-[#66635F] dark:text-[#BDB8B0] text-xs sm:text-sm font-light leading-relaxed max-w-md">
              Each villa offers secluded grounds, private infinity pools, and dedicated 24/7 personal hospitality.
            </p>
            {activeFilter && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B99A62]/10 border border-[#B99A62]/30 text-xs text-[#202020] dark:text-[#FCFBF8]">
                <span>Showing results for: <strong>{activeFilter}</strong></span>
                {onClearFilter && (
                  <button
                    type="button"
                    onClick={onClearFilter}
                    className="text-[#B99A62] hover:underline font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {villas.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-[12px] bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] text-center max-w-xl mx-auto space-y-4 shadow-sm my-6">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#202020] dark:text-[#FCFBF8]">
              {activeFilter ? `No Villas Found Matching "${activeFilter}"` : "No Active Villa Residences Found"}
            </h3>
            <p className="text-[#66635F] dark:text-[#BDB8B0] text-xs sm:text-sm leading-relaxed font-light">
              {activeFilter
                ? "Try searching for another keyword or clear the current experience filter to view all available private sanctuaries in Udaipur."
                : "Our private estate collection is currently being updated. Please check back shortly."}
            </p>
            <div className="pt-2">
              {activeFilter && onClearFilter ? (
                <button
                  type="button"
                  onClick={onClearFilter}
                  className="px-6 py-2.5 bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF8] dark:text-[#202020] text-xs uppercase tracking-[0.2em] font-bold inline-block rounded-[6px] transition-all cursor-pointer"
                >
                  View All Udaipur Villas
                </button>
              ) : (
                <Link
                  href="/admin/villas"
                  className="px-6 py-2.5 bg-[#202020] hover:bg-[#171717] text-white text-xs uppercase tracking-[0.2em] font-bold inline-block rounded-[6px]"
                >
                  Manage Villas
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Mobile View (< lg): Section Title & 1-by-1 Swipeable Villa Cards */}
            <div className="block lg:hidden space-y-3.5 sm:space-y-4">
              {/* Mobile Intro Header between Hero Images and Villa Cards */}
              <div className="text-center space-y-1.5 px-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8A0A8]/10 border border-[#E8A0A8]/30 text-[#202020] dark:text-[#FCFBF8] text-[9px] font-semibold uppercase tracking-[0.25em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B99A62]" />
                  OUR PRIVATE SANCTUARIES
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#202020] dark:text-[#FCFBF8] tracking-tight">
                  Explore Luxury Villas
                </h2>
                <p className="text-[#66635F] dark:text-[#BDB8B0] text-[11px] sm:text-xs font-light leading-relaxed max-w-sm mx-auto">
                  Handcrafted private pool retreats with personalized hospitality and serene natural views.
                </p>
              </div>

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

