"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";

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

// 3D-styled illustrated pastel vector icons matching reference
function PrivatePoolIcon() {
  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FFF5F2]/80 to-[#F5D0B5]/40 backdrop-blur-md flex items-center justify-center p-2 shadow-sm border border-white/25">
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Swimmer head & body */}
        <circle cx="28" cy="20" r="4.5" fill="#FAD4D8" stroke="#E8A0A8" strokeWidth="1.5" />
        <path d="M22 28C24 24 30 24 36 27L42 30" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" />
        {/* Water waves */}
        <path d="M10 38C15 36 20 40 25 38C30 36 35 40 40 38C45 36 50 40 54 38" stroke="#8ED1FC" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M12 46C17 44 22 48 27 46C32 44 37 48 42 46C47 44 52 48 56 46" stroke="#F5D0B5" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function InHouseChefIcon() {
  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FFF5F2]/80 to-[#F5D0B5]/40 backdrop-blur-md flex items-center justify-center p-2 shadow-sm border border-white/25">
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Chef Toque / Hat */}
        <path d="M24 24C20 24 18 20 22 15C25 11 30 11 32 14C34 11 39 11 42 15C46 20 44 24 40 24H24Z" fill="#FEECEB" stroke="#E8A0A8" strokeWidth="1.8" />
        {/* Head */}
        <circle cx="32" cy="29" r="6" fill="#FAD4D8" />
        {/* Chef Coat */}
        <path d="M22 40C22 36 27 35 32 35C37 35 42 36 42 40V48H22V40Z" fill="#FFFFFF" fillOpacity="0.9" />
        {/* Buttons */}
        <circle cx="30" cy="40" r="1" fill="#E8A0A8" />
        <circle cx="30" cy="44" r="1" fill="#E8A0A8" />
        <circle cx="34" cy="40" r="1" fill="#E8A0A8" />
        <circle cx="34" cy="44" r="1" fill="#E8A0A8" />
      </svg>
    </div>
  );
}

function ButlerServiceIcon() {
  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FFF5F2]/80 to-[#F6D2B8]/40 backdrop-blur-md flex items-center justify-center p-2 shadow-sm border border-white/25">
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Butler head with hair */}
        <path d="M25 24C25 20 28 17 32 17C36 17 39 20 39 24C39 28 36 30 32 30C28 30 25 28 25 24Z" fill="#FAD4D8" />
        <path d="M25 22C25 18 28 16 32 16C36 16 39 18 39 20" stroke="#202020" strokeWidth="2.5" strokeLinecap="round" />
        {/* Suit & Bow tie */}
        <path d="M20 42C20 35 25 34 32 34C39 34 44 35 44 42V49H20V42Z" fill="#FFFFFF" fillOpacity="0.95" />
        <path d="M29 36L32 38L35 36L32 40L29 36Z" fill="#EFA1AA" />
      </svg>
    </div>
  );
}

function CaretakerOnsiteIcon() {
  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FFF5F2]/80 to-[#F6D2B8]/40 backdrop-blur-md flex items-center justify-center p-2 shadow-sm border border-white/25">
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rosette with soft blush & peach sparkles */}
        <circle cx="32" cy="32" r="13" fill="url(#caretaker-sun)" />
        <circle cx="32" cy="32" r="9" fill="#FFF5F2" fillOpacity="0.8" />
        {/* Sparkles */}
        <path d="M44 18L45 15L48 14L45 13L44 10L43 13L40 14L43 15L44 18Z" fill="#F6D2B8" />
        <path d="M20 18L21 16L23 15L21 14L20 12L19 14L17 15L19 16L20 18Z" fill="#EFA1AA" />
        <path d="M48 40L49 38L51 37L49 36L48 34L47 36L45 37L47 38L48 40Z" fill="#EFA1AA" />
        <defs>
          <linearGradient id="caretaker-sun" x1="19" y1="19" x2="45" y2="45" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F6D2B8" />
            <stop offset="0.6" stopColor="#EFA1AA" />
            <stop offset="1" stopColor="#F6C7CA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

const DARANGA_STANDARD_SLIDES: StandardSlide[] = [
  {
    id: "hospitality-standard",
    title: "The Daranga Standard",
    subtitle: "Enjoy our signature features that make every stay effortless and enjoyable.",
    image: "https://i.pinimg.com/736x/fe/55/40/fe5540ececa2abd4b1e2594fed9399c4.jpg",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUA6mMQZ9jQ9VXUjrqdp8vZBvS494lM1zymp-h0bJ0Aqce_pwK7yrOhLc&s=10",
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
