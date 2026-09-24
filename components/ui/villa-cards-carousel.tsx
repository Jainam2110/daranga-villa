"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Villa } from "@/types/villa";
import { VillaCard } from "@/components/ui/villa-card";

interface VillaCardsCarouselProps {
  villas: Villa[];
  onViewClick?: (villaId: string) => void;
  className?: string;
  gridClassName?: string;
}

export function VillaCardsCarousel({
  villas,
  onViewClick,
  className = "",
  gridClassName = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
}: VillaCardsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || villas.length <= 1) return;

    const scrollLeft = el.scrollLeft;
    const containerWidth = el.clientWidth || 1;
    const newIndex = Math.min(
      Math.max(Math.round(scrollLeft / containerWidth), 0),
      villas.length - 1
    );

    setActiveIndex(newIndex);
  }, [villas.length]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const scrollToIndex = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const containerWidth = el.clientWidth;
    el.scrollTo({
      left: index * containerWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < villas.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
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

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!villas || villas.length === 0) {
    return null;
  }

  return (
    <div className={`w-full min-w-0 ${className}`}>
      {/* Mobile: Partial Peek Swipeable Carousel (< md) | Desktop: Multi-column Grid (md+) */}
      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`
          flex md:grid
          overflow-x-auto md:overflow-visible
          snap-x snap-mandatory md:snap-none
          scrollbar-none scroll-touch-pan
          gap-4 md:gap-8
          pb-2 md:pb-0
          px-1 md:px-0
          ${gridClassName}
        `}
      >
        {villas.map((villa, idx) => (
          <div
            key={villa.id || villa._id || idx}
            className="w-[85vw] sm:w-[360px] md:w-auto min-w-[280px] flex-shrink-0 snap-start md:snap-align-none"
          >
            <VillaCard villa={villa} onViewClick={onViewClick} />
          </div>
        ))}
      </div>

      {/* Mobile-only Navigation Controls (Prev/Next buttons + Counter + Dots) */}
      {villas.length > 1 && (
        <div className="flex md:hidden items-center justify-between pt-4 pb-2 px-1">
          {/* Prev Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous villa"
            className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 transition-all shadow-sm flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Center Indicator: Counter & Dots */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-[var(--accent)] uppercase">
              {String(activeIndex + 1).padStart(2, "0")} / {String(villas.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              {villas.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Go to villa ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    idx === activeIndex
                      ? "w-6 h-1.5 bg-[var(--accent)]"
                      : "w-1.5 h-1.5 bg-[var(--border-color)] hover:bg-[var(--text-secondary)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === villas.length - 1}
            aria-label="Next villa"
            className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 transition-all shadow-sm flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
