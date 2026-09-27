"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles, Compass } from "lucide-react";
import { Container } from "@/components/ui/container";

interface CuratedExperience {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  image: string;
  highlight: string;
}

const EXPERIENCES: CuratedExperience[] = [
  {
    id: "poolside-night",
    title: "Illuminated Pool & Starlit Evenings",
    subtitle: "PRIVATE POOL & EVENING RETREAT",
    category: "Aquatic Escape",
    description:
      "Enjoy tranquil evenings beside your private illuminated swimming pool and verdant garden lawn, complete with poolside dining, starlit gazebos, and ambient villa lighting.",
    image: "/images/experiences/poolside-night.jpg",
    highlight: "Temperature Controlled • Ambient Mood Lighting",
  },
  {
    id: "balcony-views",
    title: "Serene Balcony & Mountain Overlook",
    subtitle: "SCENIC BALCONY & VALLEY VIEWS",
    category: "Aravalli Panorama",
    description:
      "Begin your morning with artisanal tea from plush private terrace seating, breathing in pure mountain air with uninterrupted panoramic vistas of Udaipur's golden valleys.",
    image: "/images/experiences/balcony-view.jpg",
    highlight: "Sunrise Vistas • Plush Daybed Seating",
  },
  {
    id: "bedroom-suite",
    title: "Bespoke Master Bedrooms & Lounge",
    subtitle: "LUXURY MASTER SUITES & COMFORT",
    category: "Sanctuary Suites",
    description:
      "Unwind in expansive, soaring-ceiling master suites crafted with handcrafted king-sized bedding, comfortable lounge seating, climate control, and artisanal stone finishes.",
    image: "/images/experiences/bedroom-suite.jpg",
    highlight: "King Bedding • En-Suite Dressing & Spa Bath",
  },
  {
    id: "private-chef",
    title: "In-Villa Private Chef & Dining",
    subtitle: "GOURMET DINING & LIVE BBQ",
    category: "Culinary Haven",
    description:
      "Savor multi-course gourmet delicacies and poolside candlelight dinners prepared live by our private culinary team using fresh local Rajasthani ingredients.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    highlight: "Personal Butler • Tailored Royal Menus",
  },
];

const AUTO_SLIDE_INTERVAL = 4500; // 4.5 seconds

export function ExperiencesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Measure container width dynamically for pixel-perfect 3D radius calculation (radius = width / 2)
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const totalSlides = EXPERIENCES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => prev - 1);
  }, []);

  const goToSlide = (idx: number) => {
    // Smooth transition to nearest modulo match
    const currentMod = ((currentIndex % totalSlides) + totalSlides) % totalSlides;
    const diff = idx - currentMod;
    setCurrentIndex((prev) => prev + diff);
  };

  // Auto-slide effect
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused]);

  // Touch support for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  const activeIndex = ((currentIndex % totalSlides) + totalSlides) % totalSlides;
  const radius = containerWidth / 2;
  const cubeRotationAngle = currentIndex * -90;

  const handleInquireExperience = () => {
    const el = document.getElementById("villas");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="experiences"
      className="py-16 sm:py-24 lg:py-28 bg-[#FCFBF8] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] overflow-hidden"
    >
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14 select-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8A0A8]/15 dark:bg-[#E8A0A8]/20 border border-[#E8A0A8]/30 text-[#202020] dark:text-[#FCFBF8] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em]">
            <Sparkles className="w-3.5 h-3.5 text-[#B99A62]" />
            CURATED MOMENTS
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#202020] dark:text-[#FCFBF8] tracking-tight">
            Tailored Resort Experiences
          </h2>
          <p className="text-[#66635F] dark:text-[#A8A49E] text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto">
            From starlit private pool evenings to restorative morning rituals, immerse in curated sanctuary living.
          </p>
        </div>

        {/* 3D Cube Carousel Container */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative max-w-4xl mx-auto h-[500px] sm:h-[480px] md:h-[440px] select-none"
          style={{
            perspective: "1200px",
          }}
        >
          {/* 3D Rotating Cube Body */}
          <div
            className="w-full h-full relative"
            style={{
              transformStyle: "preserve-3d",
              transform: `translateZ(-${radius}px) rotateY(${cubeRotationAngle}deg)`,
              transition: "transform 0.85s cubic-bezier(0.2, 0.9, 0.3, 1)",
            }}
          >
            {EXPERIENCES.map((exp, idx) => {
              const faceAngle = idx * 90;
              const isFrontFace = idx === activeIndex;

              return (
                <div
                  key={exp.id}
                  className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-xl"
                  style={{
                    transform: `rotateY(${faceAngle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  {/* Grid Split Card: Image on Left / Top + Editorial Details on Right */}
                  <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                    {/* Visual Media Column */}
                    <div className="relative md:col-span-6 h-[220px] sm:h-[240px] md:h-full w-full bg-[#171717] overflow-hidden group">
                      <Image
                        src={exp.image}
                        alt={exp.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/30" />

                      {/* Badge on Photo */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase font-semibold tracking-wider">
                          <Compass className="w-3 h-3 text-[#B99A62]" />
                          {exp.category}
                        </span>
                      </div>
                    </div>

                    {/* Editorial Content Column */}
                    <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-[#202020]">
                      <div className="space-y-3">
                        {/* Subtitle tag */}
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B99A62] block">
                          {exp.subtitle}
                        </span>

                        {/* Title */}
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#202020] dark:text-[#FCFBF8] leading-tight tracking-tight">
                          {exp.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[#66635F] dark:text-[#A8A49E] text-xs sm:text-sm font-light leading-relaxed">
                          {exp.description}
                        </p>
                      </div>

                      {/* Highlight & Action CTA */}
                      <div className="pt-4 border-t border-[#E8E6E2]/80 dark:border-[#383633] flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#8A8782] truncate max-w-[190px] sm:max-w-[220px]">
                          {exp.highlight}
                        </span>

                        <button
                          type="button"
                          onClick={handleInquireExperience}
                          className="px-4 py-1.5 rounded-full bg-[#202020] dark:bg-[#FCFBF8] text-white dark:text-[#202020] hover:bg-[#B99A62] dark:hover:bg-[#B99A62] dark:hover:text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-xs hover:scale-105 active:scale-95 flex-shrink-0"
                        >
                          Explore &rarr;
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic lighting depth overlay for realism */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
                      isFrontFace ? "opacity-0" : "opacity-40 bg-black"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous experience"
            className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#202020] text-[#202020] dark:text-white border border-[#E8E6E2] dark:border-[#383633] shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer hover:border-[#B99A62]"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next experience"
            className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#202020] text-[#202020] dark:text-white border border-[#E8E6E2] dark:border-[#383633] shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer hover:border-[#B99A62]"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* 3D Cube Pagination Dots & Auto-slide Indicator */}
        <div className="flex items-center justify-center gap-2.5 pt-8 sm:pt-10 select-none">
          {EXPERIENCES.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Jump to experience ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? "w-8 h-2 bg-[#B99A62] shadow-sm"
                    : "w-2 h-2 bg-[#DAD7D1] dark:bg-[#444] hover:bg-[#B99A62]/60"
                }`}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
