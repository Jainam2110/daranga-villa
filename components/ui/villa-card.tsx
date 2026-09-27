"use client";

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
      className="group/card flex flex-col bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] rounded-[20px] overflow-hidden card-luxury-hover transition-all duration-300 shadow-[0_4px_20px_rgba(32,32,32,0.04)] hover:shadow-[0_12px_32px_rgba(32,32,32,0.08)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Interactive Multi-Image Slider */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-[#171717] select-none group/img rounded-t-[20px]"
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
                className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                priority={idx === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover/card:opacity-30 transition-opacity duration-300 z-10" />
        </Link>

        {/* Tag Badge (Desktop only) */}
        <div className="hidden sm:block absolute top-3 sm:top-4 left-3 sm:left-4 z-20 pointer-events-none">
          <span className="px-3 py-1 bg-white/95 dark:bg-[#202020]/95 backdrop-blur-md text-[#202020] dark:text-white text-[10px] uppercase tracking-wider font-semibold border border-[#E8E8E8] dark:border-[#383838] rounded-full shadow-xs">
            Luxury Villa
          </span>
        </div>

        {/* Multi-Image Controls & Indicators (Only when > 1 image) */}
        {images.length > 1 && (
          <>
            {/* Image Counter Badge (Top Right - Desktop only) */}
            <div className="hidden sm:block absolute top-3 sm:top-4 right-3 sm:right-4 z-20 pointer-events-none">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono tracking-wider font-medium rounded-full border border-white/10 shadow-xs">
                {currentIdx + 1}/{images.length}
              </span>
            </div>

            {/* Previous Arrow Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[#202020] text-white border border-white/20 items-center justify-center transition-all duration-200 shadow-md opacity-0 group-hover/img:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Arrow Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[#202020] text-white border border-white/20 items-center justify-center transition-all duration-200 shadow-md opacity-0 group-hover/img:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Dots at Bottom Center */}
            <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs border border-white/10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentIdx
                      ? "w-4 sm:w-5 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-3 text-[#202020] dark:text-white">
        <div>
          <div className="text-[#777777] dark:text-[#999999] text-[11px] font-medium mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#202020] dark:text-white flex-shrink-0" />
            <span className="truncate">{getVillaAddress(villa.location, "Udaipur, Rajasthan")}</span>
          </div>

          <Link href={`/villas/${villaSlug}`} onClick={() => onViewClick?.(villa.id)}>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#202020] dark:text-white transition-colors">
              {villa.name}
            </h3>
          </Link>
        </div>

        {/* Property Specs with Lucide Icons */}
        <div className="flex items-center justify-between text-xs text-[#555555] dark:text-[#BDBDBD] py-2 border-y border-[#E8E8E8] dark:border-[#383838] font-medium">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#202020] dark:text-white" />
            <span>{guestCount} Guests</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-[#202020] dark:text-white" />
            <span>{villa.bedrooms || 1} BHK</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5 text-[#202020] dark:text-white" />
            <span>{villa.bathrooms || 1} Baths</span>
          </span>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3 mt-auto">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-xl sm:text-2xl font-bold text-[#202020] dark:text-white">
                ₹{villa.pricePerNight.toLocaleString("en-IN")}
              </span>
              <span className="font-sans text-xs text-[#777777] dark:text-[#999999] font-normal">/ night</span>
            </div>
          </div>

          <Link
            href={`/villas/${villaSlug}`}
            onClick={() => onViewClick?.(villa.id)}
            className="text-center px-4 sm:px-5 py-2 sm:py-2.5 bg-[#202020] hover:bg-[#171717] text-white dark:bg-white dark:hover:bg-stone-200 dark:text-[#202020] text-xs font-semibold uppercase tracking-wider transition-all duration-200 rounded-full flex items-center justify-center gap-1.5 flex-shrink-0 shadow-xs hover:scale-105 active:scale-95"
          >
            <span>View Villa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
