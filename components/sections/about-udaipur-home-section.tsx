"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  Waves,
  Landmark,
  Compass,
  UtensilsCrossed,
  Crown,
  Camera,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function AboutUdaipurHomeSection() {
  const highlightPills = [
    {
      id: "lakes",
      label: "BEAUTIFUL LAKES",
      icon: Waves,
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "heritage",
      label: "ROYAL HERITAGE",
      icon: Landmark,
      image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "hills",
      label: "SCENIC ARAVALLI HILLS",
      icon: Compass,
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "culture",
      label: "VIBRANT CULTURE",
      icon: UtensilsCrossed,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "luxury",
      label: "LUXURY STAYS",
      icon: Crown,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "cuisine",
      label: "RAJASTHANI CUISINE",
      icon: UtensilsCrossed,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "experiences",
      label: "MEMORABLE EXPERIENCES",
      icon: Camera,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#FCFBF9] dark:bg-[#171717] transition-colors duration-200">
      <Container>
        {/* Main Clickable Hero Card Banner */}
        <Link
          href="/about-udaipur"
          aria-label="Explore About Udaipur Page"
          className="group block relative w-full rounded-3xl overflow-hidden border border-[#E8E8E8] dark:border-[#383838] bg-[#171717] shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
        >
          {/* Background Photography with Golden Hour / Sunset Vignette */}
          <div className="relative min-h-[460px] sm:min-h-[480px] lg:min-h-[500px] w-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85"
              alt="About Udaipur - The City of Lakes"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_30%] filter brightness-[0.88] group-hover:scale-105 transition-transform duration-1000 ease-out"
            />

            {/* Dark & Warm Sunset Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 lg:to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10" />

            {/* Content Container */}
            <div className="relative z-20 h-full w-full p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              {/* Top Banner Content Header */}
              <div className="max-w-2xl space-y-3.5 sm:space-y-4">
                {/* Eyebrow Cursive Style Badge */}
                <div className="flex items-center gap-2">
                  <span className="font-serif italic text-2xl sm:text-3xl text-[#EFA1AA] drop-shadow-md">
                    About
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-white">
                    RAJASTHAN
                  </span>
                </div>

                {/* Primary Serif Headline */}
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white drop-shadow-lg tracking-tight leading-[1.08]">
                  UDAIPUR
                </h2>

                {/* Tagline */}
                <div className="text-xs sm:text-base font-semibold uppercase tracking-[0.16em] text-[#F6C7CA] drop-shadow-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#EFA1AA] flex-shrink-0" />
                  <span>The City of Lakes, Heritage & Royal Experiences</span>
                </div>

                {/* Narrative Intro Paragraph */}
                <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed max-w-xl drop-shadow-md line-clamp-3 sm:line-clamp-none">
                  Udaipur is a timeless city where royal heritage, serene lakes, stunning architecture and vibrant culture come together to create unforgettable experiences. Nestled in the Aravalli Hills, Udaipur offers a perfect blend of history, nature, luxury and warm hospitality.
                </p>

                {/* Callout Link Line */}
                <div className="pt-1 flex items-center gap-3 text-xs sm:text-sm font-serif italic text-white font-medium group-hover:text-[#EFA1AA] transition-colors">
                  <span>Come &amp; discover the royal charm of Udaipur</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#EFA1AA] group-hover:text-[#202020] transition-all flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white group-hover:text-[#202020]" />
                  </div>
                </div>
              </div>

              {/* Bottom Strip: 7 Curated Experience Cards */}
              <div className="pt-8 sm:pt-10 z-20">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
                  {highlightPills.map((pill) => {
                    const Icon = pill.icon;
                    return (
                      <div
                        key={pill.id}
                        className="group/card relative rounded-xl overflow-hidden bg-black/60 backdrop-blur-md border border-white/20 hover:border-[#EFA1AA] transition-all duration-300 p-2 text-center flex flex-col items-center justify-between shadow-md hover:scale-105"
                      >
                        {/* Thumbnail background */}
                        <div className="relative w-full h-16 sm:h-18 rounded-lg overflow-hidden mb-2 border border-white/15">
                          <Image
                            src={pill.image}
                            alt={pill.label}
                            fill
                            sizes="120px"
                            className="object-cover group-hover/card:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/30" />
                          <div className="absolute bottom-1 right-1 p-1 rounded-full bg-black/60 text-white border border-white/20">
                            <Icon className="w-3 h-3 text-[#EFA1AA]" />
                          </div>
                        </div>

                        {/* Title */}
                        <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-white group-hover/card:text-[#EFA1AA] transition-colors line-clamp-1">
                          {pill.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
}
