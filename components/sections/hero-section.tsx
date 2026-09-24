"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";

interface HeroSectionProps {
  heroImageUrl?: string;
  heroImages?: string[];
  onExploreClick?: () => void;
}

interface HeroSlide {
  url: string;
  tagline: string;
  title: string;
  subtitle: string;
  caption: string;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    url: "/images/hero/heroimg.webp",
    tagline: "DARANGA SANCTUARIES",
    title: "Villas For\nLuxury Living",
    subtitle: "Where timeless heritage meets private modern luxury",
    caption: "The Grand Sanctuary Estate",
  },
  {
    url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2070&q=85",
    tagline: "PRIVATE INFINITY POOLS",
    title: "Villas With\nPrivate Pools",
    subtitle: "Serene aquatic escapes enveloped by tranquil nature",
    caption: "Infinity Twilight Pools",
  },
  {
    url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2074&q=85",
    tagline: "BESPOKE ARCHITECTURE",
    title: "Bespoke\nArchitecture",
    subtitle: "Handcrafted stone, soaring ceilings & sunlit spaces",
    caption: "Architectural Pavilions",
  },
  {
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2070&q=85",
    tagline: "SECLUDED RETREAT",
    title: "Secluded\nNature Retreats",
    subtitle: "Bespoke privacy amidst Udaipur's peaceful valleys",
    caption: "Secluded Tropical Grounds",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=85",
    tagline: "SUNSET VERANDAS",
    title: "Sunset &\nStarlit Evenings",
    subtitle: "Unwind under the evening sky in absolute tranquility",
    caption: "Sunset Verandas & Lounges",
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
  onExploreClick,
}: HeroSectionProps) {
  // Consolidate slides: prioritize dynamic images if provided
  const slides: HeroSlide[] = React.useMemo(() => {
    if (heroImages && heroImages.length > 0) {
      return heroImages.map((url, idx) => {
        const theme = SANCTUARY_THEMES[idx % SANCTUARY_THEMES.length];
        return {
          url,
          tagline: theme.tagline,
          title: theme.title,
          subtitle: theme.subtitle,
          caption: theme.title,
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
        },
        ...DEFAULT_HERO_SLIDES.slice(1),
      ];
    }
    return DEFAULT_HERO_SLIDES;
  }, [heroImageUrl, heroImages]);

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
      className="relative h-[50vh] sm:h-[55vh] lg:h-[100dvh] min-h-[300px] sm:min-h-[380px] lg:min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[#0B0B0A] text-[#F5F1E8] touch-pan-y"
    >
      {/* Background Slides with Ken Burns and Crossfade transitions */}
      <div className="absolute inset-0 z-0 w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.url + idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
            >
              <div
                className={`relative w-full h-full ${isActive ? "animate-ken-burns" : "scale-100"
                  }`}
              >
                <Image
                  src={slide.url}
                  alt={slide.caption}
                  fill
                  priority={idx === 0 || idx === 1}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          );
        })}

        {/* Ambient Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-black/20 to-black/20 lg:from-black/90 lg:via-black/45 lg:to-black/30 pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-radial from-transparent via-black/10 to-black/40 lg:via-black/20 lg:to-black/70 pointer-events-none" />

        {/* Subtle Ambient Golden Glow (Slow Pulse) */}
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent)]/10 blur-[120px] pointer-events-none animate-ambient-glow z-20" />
      </div>

      {/* Mobile Dead-Center Text (Pure clean text, no background, no border, exactly like reference) */}
      <div className="block lg:hidden absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-6 text-center">
        <div
          key={currentIndex}
          className="transition-all duration-700 animate-in fade-in zoom-in-95"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] tracking-tight leading-[1.2] whitespace-pre-line select-none">
            {slides[currentIndex]?.title}
          </h2>
        </div>
      </div>

      {/* Mobile Subtle Left & Right Arrow Navigation (Like reference image) */}
      <div className="flex lg:hidden absolute inset-y-0 left-2 right-2 z-20 items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-transform active:scale-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-transform active:scale-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Hero Central Editorial Content (Desktop only) */}
      <Container className="hidden lg:flex relative z-30 text-center pt-20 sm:pt-24 lg:pt-28 justify-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
          {/* Eyebrow Label with subtle float and golden glow */}
          <div key={currentIndex} className="animate-in fade-in duration-500">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[var(--accent)]/40 font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] shadow-[0_0_20px_rgba(200,155,74,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              {slides[currentIndex]?.tagline || "DARANGA VILLA SANCTUARIES"}
            </span>
          </div>

          {/* Large Headline with Cormorant Garamond */}
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light sm:font-normal tracking-tight text-white drop-shadow-lg leading-[1.06] select-none">
            PRIVATE.<br />
            TIMELESS.<br />
            <span className="italic font-light text-[#ECD5A8]">YOURS.</span>
          </h1>

          {/* Minimal Supporting Text */}
          <p className="max-w-xl text-stone-200 text-sm sm:text-base font-light leading-relaxed tracking-wide px-4">
            An exclusive private sanctuary designed for quiet elegance, architectural serenity, and uncompromised personal hospitality.
          </p>

          {/* Action CTAs with Shimmer Animation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
            <button
              onClick={onExploreClick}
              className="btn-luxury-shimmer w-full sm:w-auto px-8 py-3.5 rounded-[6px] bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-2xl hover:scale-[1.03] active:scale-95"
            >
              EXPLORE VILLAS
            </button>
            <a
              href="#experience"
              className="w-full sm:w-auto px-8 py-3.5 rounded-[6px] bg-black/45 hover:bg-white/15 text-white border border-white/30 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 backdrop-blur-md text-center hover:border-white/60 active:scale-95"
            >
              OUR PHILOSOPHY
            </a>
          </div>
        </div>
      </Container>

      {/* Desktop Prev / Next Slider Navigation Arrows */}
      <div className="hidden lg:flex absolute inset-y-0 left-6 right-6 z-30 items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="pointer-events-auto w-11 h-11 rounded-full bg-black/35 hover:bg-black/75 border border-white/20 hover:border-[var(--accent)] text-white/70 hover:text-[var(--accent)] flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="pointer-events-auto w-11 h-11 rounded-full bg-black/35 hover:bg-black/75 border border-white/20 hover:border-[var(--accent)] text-white/70 hover:text-[var(--accent)] flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Modern Luxury Progress Bar & Slide Controller (Bottom) */}
      <div className="absolute bottom-2.5 sm:bottom-5 lg:bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 sm:px-6 flex flex-col items-center gap-1.5 sm:gap-3">
        {/* Slide Counter & Active Caption */}
        <div className="flex items-center justify-between w-full text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-white/80 uppercase font-medium">
          <span className="font-mono text-[var(--accent)] font-semibold">
            {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <span className="truncate max-w-[200px] sm:max-w-[320px] text-stone-200 font-serif italic text-xs normal-case tracking-normal">
            {slides[currentIndex]?.caption}
          </span>
          <span className="text-[9px] text-[var(--accent)]/80 tracking-widest hidden sm:inline">
            5S AUTO
          </span>
        </div>

        {/* Multi-segment Progress Bars */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full">
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            const isPassed = idx < currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className="group relative flex-1 h-1.5 py-1 sm:py-2 cursor-pointer flex items-center"
              >
                <div className="w-full h-0.5 sm:h-1 bg-white/25 rounded-full overflow-hidden transition-colors group-hover:bg-white/40">
                  {isActive && (
                    <div
                      key={currentIndex}
                      className="h-full bg-[var(--accent)] rounded-full animate-progress-5s shadow-[0_0_8px_rgba(200,155,74,0.8)]"
                      style={{
                        animationPlayState: isPaused ? "paused" : "running",
                      }}
                    />
                  )}
                  {isPassed && (
                    <div className="w-full h-full bg-[var(--accent)]/70 rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
