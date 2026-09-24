import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Users, Bed, Bath, MapPin, ArrowRight } from "lucide-react";
import { Villa } from "@/types/villa";
import { getAllVillaImageUrls } from "@/lib/utils/image";
import { getVillaAddress } from "@/lib/utils/villa-location";

interface VillaCardProps {
  villa: Villa;
  onViewClick?: (villaId: string) => void;
}

export function VillaCard({ villa, onViewClick }: VillaCardProps) {
  const images = getAllVillaImageUrls(villa.images, villa.imageUrl);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const villaSlug = villa.slug || villa.id;
  const guestCount = villa.maxGuests || 4;

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

  // Smooth auto-slide effect (4s duration, pauses on hover or touch)
  useEffect(() => {
    if (images.length <= 1 || isHovered || isTouched) return;

    const timer = setTimeout(() => {
      setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, 4000);

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
          // swipe left -> next image
          handleNext();
        } else {
          // swipe right -> prev image
          handlePrev();
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    // Resume auto-sliding 2.5s after touch ends
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
      className="group/card flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] overflow-hidden card-luxury-hover transition-all duration-500 hover:border-[var(--accent)]/50 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Interactive Multi-Image Slider */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-[#151412] select-none group/img"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={`/villas/${villaSlug}`}
          onClick={() => onViewClick?.(villa.id)}
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover/card:scale-105"
                priority={idx === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/card:opacity-30 transition-opacity duration-500 z-10" />
        </Link>

        {/* Tag Badge (Desktop only) */}
        <div className="hidden sm:block absolute top-3 sm:top-4 left-3 sm:left-4 z-20 pointer-events-none">
          <span className="px-2.5 sm:px-3 py-1 bg-[var(--bg-primary)]/90 backdrop-blur-md text-[var(--accent)] text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold border border-[var(--accent)]/30 rounded-[4px] shadow-sm">
            Exclusive Estate
          </span>
        </div>

        {/* Multi-Image Controls & Indicators (Only when > 1 image) */}
        {images.length > 1 && (
          <>
            {/* Image Counter Badge (Top Right - Desktop only) */}
            <div className="hidden sm:block absolute top-3 sm:top-4 right-3 sm:right-4 z-20 pointer-events-none">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/60 backdrop-blur-md text-stone-200 text-[9px] sm:text-[10px] font-mono tracking-wider font-medium rounded-[4px] border border-white/10 shadow-sm">
                {currentIdx + 1}/{images.length}
              </span>
            </div>

            {/* Previous Arrow Button (Desktop only on hover) */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] items-center justify-center transition-all duration-200 shadow-md opacity-0 group-hover/img:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100"
            >
              <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Next Arrow Button (Desktop only on hover) */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] items-center justify-center transition-all duration-200 shadow-md opacity-0 group-hover/img:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100"
            >
              <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Pagination Dots at Bottom Center */}
            <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs border border-white/10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIdx
                      ? "w-4 sm:w-5 h-1.5 bg-[#C89B4A]"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4 text-[var(--text-primary)]">
        <div>
          <div className="text-[var(--accent)] text-[10px] font-semibold uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{getVillaAddress(villa.location, "Daranga Estate")}</span>
          </div>

          <Link href={`/villas/${villaSlug}`} onClick={() => onViewClick?.(villa.id)}>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[var(--text-primary)] group-hover/card:text-[var(--accent)] transition-colors">
              {villa.name}
            </h3>
          </Link>
        </div>

        {/* Property Specs with Lucide Icons */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] py-2.5 sm:py-3 border-y border-[var(--border-color)] font-medium">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{guestCount} Guests</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{villa.bedrooms || 1} BHK</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{villa.bathrooms || 1} Baths</span>
          </span>
        </div>

        <div className="pt-2 sm:pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between gap-3 mt-auto">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] block font-medium">From</span>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-lg sm:text-2xl font-bold text-[var(--text-primary)]">
                ₹{villa.pricePerNight.toLocaleString("en-IN")}
              </span>
              <span className="font-sans text-xs text-[var(--text-secondary)] font-normal">/ night</span>
            </div>
          </div>

          <Link
            href={`/villas/${villaSlug}`}
            onClick={() => onViewClick?.(villa.id)}
            className="btn-luxury-shimmer text-center px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-[#0B0B0A] border border-[var(--border-color)] hover:border-[var(--accent)] text-[11px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] font-bold transition-all duration-300 rounded-[6px] flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm hover:scale-105 active:scale-95"
          >
            <span>EXPLORE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

