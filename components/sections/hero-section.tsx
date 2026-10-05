"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlideItem {
  _id?: string;
  id?: string;
  url: string;
  title?: string;
  tagline?: string;
  subtitle?: string;
  caption?: string;
  objectPosition?: string;
  order?: number;
  isActive?: boolean;
}

interface HeroSectionProps {
  heroImageUrl?: string;
  heroImages?: string[];
  customHeroSlides?: HeroSlideItem[];
}

interface HeroSlide {
  url: string;
  tagline?: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  objectPosition?: string;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    url: "/images/hero/heroimg.webp",
    tagline: "DARANGA SANCTUARIES",
    title: "Villas For\nLuxury Living",
    subtitle: "Where timeless heritage meets private modern luxury",
    caption: "The Grand Sanctuary Estate",
    objectPosition: "center center",
  },
  {
    url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2070&q=85",
    tagline: "PRIVATE INFINITY POOLS",
    title: "Villas With\nPrivate Pools",
    subtitle: "Serene aquatic escapes enveloped by tranquil nature",
    caption: "Infinity Twilight Pools",
    objectPosition: "center center",
  },
  {
    url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2074&q=85",
    tagline: "BESPOKE ARCHITECTURE",
    title: "Bespoke\nArchitecture",
    subtitle: "Handcrafted stone, soaring ceilings & sunlit spaces",
    caption: "Architectural Pavilions",
    objectPosition: "center center",
  },
  {
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2070&q=85",
    tagline: "SECLUDED RETREAT",
    title: "Secluded\nNature Retreats",
    subtitle: "Bespoke privacy amidst Udaipur's peaceful valleys",
    caption: "Secluded Tropical Grounds",
    objectPosition: "center center",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=85",
    tagline: "SUNSET VERANDAS",
    title: "Sunset &\nStarlit Evenings",
    subtitle: "Unwind under the evening sky in absolute tranquility",
    caption: "Sunset Verandas & Lounges",
    objectPosition: "center center",
  },
];

const SANCTUARY_THEMES = [
  { tagline: "DARANGA SANCTUARIES", title: "Villas For\nLuxury Living", subtitle: "Private luxury living in Udaipur" },
  { tagline: "PRIVATE INFINITY POOLS", title: "Villas With\nPrivate Pools", subtitle: "Serene poolside escapes enveloped by nature" },
  { tagline: "BESPOKE ARCHITECTURE", title: "Bespoke\nArchitecture", subtitle: "Handcrafted stone & soaring sunlit verandas" },
  { tagline: "SECLUDED RETREAT", title: "Secluded\nNature Retreats", subtitle: "Bespoke privacy amidst peaceful landscapes" },
  { tagline: "SUNSET VERANDAS", title: "Sunset &\nStarlit Evenings", subtitle: "Unwind under the evening sky in tranquility" },
];

const SLIDE_DURATION = 5000; // 5 seconds per slide

export function HeroSection({
  heroImageUrl,
  heroImages,
  customHeroSlides,
}: HeroSectionProps) {
  // Consolidate slides: prioritize dynamic admin slides, then dynamic villa images if provided
  const slides: HeroSlide[] = React.useMemo(() => {
    if (customHeroSlides && customHeroSlides.length > 0) {
      return customHeroSlides.map((s) => ({
        url: s.url,
        tagline: s.tagline ?? "",
        title: s.title ?? "",
        subtitle: s.subtitle ?? "",
        caption: s.caption || s.title || "",
        objectPosition: s.objectPosition || "center center",
      }));
    }
    if (heroImages && heroImages.length > 0) {
      return heroImages.map((url, idx) => {
        const theme = SANCTUARY_THEMES[idx % SANCTUARY_THEMES.length];
        return {
          url,
          tagline: theme.tagline,
          title: theme.title,
          subtitle: theme.subtitle,
          caption: theme.title,
          objectPosition: "center center",
        };
      });
    }
    if (heroImageUrl) {
      return [
        {
          url: heroImageUrl,
          tagline: "DARANGA SANCTUARIES",
          title: "Grand Sanctuary Residence",
          subtitle: "Where timeless heritage meets private modern luxury",
          caption: "Grand Sanctuary Residence",
          objectPosition: "center center",
        },
        ...DEFAULT_HERO_SLIDES.slice(1),
      ];
    }
    return DEFAULT_HERO_SLIDES;
  }, [customHeroSlides, heroImageUrl, heroImages]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // 5-second rotation effect
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, currentIndex]);

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
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full aspect-[16/9] min-h-[240px] max-h-[82vh] flex items-center justify-center overflow-hidden rounded-b-[24px] sm:rounded-b-[32px] md:rounded-b-[36px] lg:rounded-b-[42px] bg-[#171717] text-white touch-pan-y shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
    >
      {/* Background Slides with Ken Burns, Focal Positioning and Crossfade transitions */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden rounded-b-[24px] sm:rounded-b-[32px] md:rounded-b-[36px] lg:rounded-b-[42px]">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const pos = slide.objectPosition || "center center";
          return (
            <div
              key={slide.url + idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Ambient Background Depth Layer */}
              <div className="absolute inset-0 w-full h-full overflow-hidden scale-110 pointer-events-none">
                <Image
                  src={slide.url}
                  alt=""
                  fill
                  aria-hidden="true"
                  className="object-cover blur-2xl opacity-40"
                />
              </div>

              {/* Primary Crisp Image */}
              <div
                className={`relative w-full h-full ${
                  isActive ? "animate-ken-burns" : "scale-100"
                }`}
              >
                <Image
                  src={slide.url}
                  alt={slide.caption || slide.title || "Daranga Sanctuary"}
                  fill
                  priority={idx === 0 || idx === 1}
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: pos }}
                />
              </div>
            </div>
          );
        })}

        {/* Subtle Dark Vignette & Neutral Overlays for Text Legibility */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/30 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-radial from-transparent via-black/15 to-black/45 pointer-events-none" />
      </div>

      {/* Center Headline */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 text-center space-y-2 sm:space-y-4 pt-10 sm:pt-12 pb-5 sm:pb-8 pointer-events-none">
        {(() => {
          const currentSlide = slides[currentIndex];
          const hasTagline = Boolean(currentSlide?.tagline?.trim());
          const hasTitle = Boolean(currentSlide?.title?.trim());
          const hasSubtitle = Boolean(currentSlide?.subtitle?.trim());
          const hasAnyText = hasTagline || hasTitle || hasSubtitle;

          if (!hasAnyText) return null;

          return (
            <div
              key={currentIndex}
              className="transition-all duration-700 animate-in fade-in zoom-in-95 max-w-xl mx-auto space-y-1.5 sm:space-y-3.5"
            >
              {/* Eyebrow / Tagline */}
              {hasTagline && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EFA1AA] animate-pulse" />
                  {currentSlide?.tagline}
                </span>
              )}

              {/* Primary Editorial Serif Headline */}
              {hasTitle && (
                <h1 className="font-serif text-xl sm:text-3xl md:text-5xl lg:text-6xl font-normal text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] tracking-tight leading-[1.15] select-none whitespace-pre-line">
                  {currentSlide?.title}
                </h1>
              )}

              {/* Subtitle */}
              {hasSubtitle && (
                <p className="text-stone-200 text-[11px] sm:text-sm font-light max-w-md mx-auto drop-shadow-md leading-relaxed hidden sm:block">
                  {currentSlide?.subtitle}
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Subtle Left & Right Arrow Navigation */}
      <div className="absolute inset-y-0 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 z-20 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="pointer-events-auto w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white bg-black/25 hover:bg-black/60 border border-white/20 backdrop-blur-xs transition-all hover:scale-110 active:scale-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="pointer-events-auto w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white bg-black/25 hover:bg-black/60 border border-white/20 backdrop-blur-xs transition-all hover:scale-110 active:scale-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Slide Indicators & Caption Controller */}
      <div className="absolute bottom-3 sm:bottom-6 lg:bottom-9 left-1/2 -translate-x-1/2 z-20 w-full max-w-md sm:max-w-xl px-4 sm:px-6 flex flex-col items-center gap-1 sm:gap-2">
        {/* Slide Counter & Active Caption */}
        <div className="flex items-center justify-between w-full text-[8px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] text-white/80 uppercase font-medium">
          <span className="font-mono text-white font-semibold">
            {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <span className="truncate max-w-[160px] sm:max-w-[360px] text-stone-200 font-serif italic text-[10px] sm:text-xs normal-case tracking-normal">
            {slides[currentIndex]?.caption}
          </span>
          <span className="font-mono text-[9px] text-white/60 tracking-widest hidden sm:inline">
            SANCTUARY
          </span>
        </div>

        {/* Clean Slide Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full pt-0.5">
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? "w-6 sm:w-10 h-1 sm:h-1.5 bg-white shadow-xs"
                    : "w-1.5 sm:w-2.5 h-1 sm:h-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
