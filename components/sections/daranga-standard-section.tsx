"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";

import { Waves, ChefHat, ConciergeBell, ShieldCheck } from "lucide-react";

interface StandardFeature {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface StandardSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  features: StandardFeature[];
}

// Crisp luxury black vector icons on clean white glass badges
function PrivatePoolIcon() {
  return (
    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg border border-white/80">
      <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[1.8]" />
    </div>
  );
}

function InHouseChefIcon() {
  return (
    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg border border-white/80">
      <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[1.8]" />
    </div>
  );
}

function ButlerServiceIcon() {
  return (
    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg border border-white/80">
      <ConciergeBell className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[1.8]" />
    </div>
  );
}

function CaretakerOnsiteIcon() {
  return (
    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg border border-white/80">
      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[1.8]" />
    </div>
  );
}

const DARANGA_STANDARD_SLIDES: StandardSlide[] = [
  {
    id: "hospitality-standard",
    title: "The Daranga Standard",
    subtitle: "Enjoy our signature features that make every stay effortless and enjoyable.",
    image: "/images/villas/WhatsApp Image 2026-10-05 at 12.10.38.jpeg",
    features: [
      { id: "pool", name: "Private Pool", icon: <PrivatePoolIcon /> },
      { id: "chef", name: "In-house Chef", icon: <InHouseChefIcon /> },
      { id: "butler", name: "Butler Service", icon: <ButlerServiceIcon /> },
      { id: "caretaker", name: "Caretaker Onsite", icon: <CaretakerOnsiteIcon /> },
    ],
  },
  {
    id: "estate-wellness",
    title: "Serenity & Wellness",
    subtitle: "Unwind with bespoke culinary rituals and scenic poolside tranquility.",
    image: "/images/villas/WhatsApp Image 2026-10-05 at 12.10.39 (2).jpeg",
    features: [
      { id: "pool", name: "Private Pool", icon: <PrivatePoolIcon /> },
      { id: "chef", name: "In-house Chef", icon: <InHouseChefIcon /> },
      { id: "butler", name: "Butler Service", icon: <ButlerServiceIcon /> },
      { id: "caretaker", name: "Caretaker Onsite", icon: <CaretakerOnsiteIcon /> },
    ],
  },
];

export function DarangaStandardSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % DARANGA_STANDARD_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused]);

  const slide = DARANGA_STANDARD_SLIDES[activeSlide];

  return (
    <section className="py-6 sm:py-10 bg-transparent select-none">
      <Container>
        {/* Full Image Showcase Card with Overlaid Features */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full h-[460px] sm:h-[500px] md:h-[540px] rounded-3xl overflow-hidden shadow-xl border border-[#E8E8E8] dark:border-[#383838] bg-[#171717] group"
        >
          {/* Background Image Carousel with Crossfade */}
          {DARANGA_STANDARD_SLIDES.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === activeSlide ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          ))}

          {/* Dark Frosted Gradient Overlay for Bottom Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

          {/* Card Content & Features */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-end space-y-5 sm:space-y-6">
            {/* Headline & Description */}
            <div className="space-y-2 max-w-xl">
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-white drop-shadow-md tracking-tight">
                {slide.title}
              </h3>
              <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed max-w-lg drop-shadow-sm">
                {slide.subtitle}
              </p>
            </div>

            {/* 4 Signature Features Grid / Row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-1 sm:pt-2">
              {slide.features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex flex-col items-center text-center space-y-2 group/feat cursor-pointer"
                >
                  <div className="transition-transform duration-300 group-hover/feat:scale-110">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] sm:text-xs text-white/95 font-medium tracking-wide drop-shadow-sm line-clamp-2 leading-tight">
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination Dash Indicators */}
            <div className="flex items-center justify-center gap-2 pt-2 sm:pt-4">
              {DARANGA_STANDARD_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeSlide
                      ? "w-8 bg-white"
                      : "w-4 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
