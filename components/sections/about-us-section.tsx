"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, UtensilsCrossed } from "lucide-react";

export function AboutUsSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Secluded Privacy",
      description: "Gated estate perimeters ensuring uninterrupted tranquility for families and couples.",
    },
    {
      icon: HeartHandshake,
      title: "Personal Butler & Concierge",
      description: "Intuitive, discrete 24/7 hospitality tailored to every nuance of your holiday.",
    },
    {
      icon: UtensilsCrossed,
      title: "Private In-Villa Dining",
      description: "Fresh artisanal breakfast, live barbecue, and customized royal Rajasthani spreads.",
    },
  ];

  return (
    <section id="about" className="py-10 sm:py-14 lg:py-16 bg-white dark:bg-[#171717] text-[#202020] dark:text-white overflow-hidden select-none">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Visual Magazine Composition */}
          <div className="lg:col-span-6 relative">
            {/* Main Luxury Image */}
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full rounded-3xl overflow-hidden bg-[#202020] shadow-xl border border-[#E8E8E8] dark:border-[#383838] group">
              <Image
                src="/images/hero/heroimg.webp"
                alt="Daranga Villa Luxury Estate"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

              {/* Glassmorphic Quote Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 sm:p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-xl">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#EFA1AA] block mb-1">
                  OUR PHILOSOPHY
                </span>
                <p className="font-serif text-sm sm:text-base italic font-light leading-relaxed">
                  &ldquo;True luxury is the freedom of time and space in complete seclusion.&rdquo;
                </p>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-4 text-center">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FCFBF9] dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-xs">
                <span className="font-sans text-xl sm:text-2xl font-bold text-[#202020] dark:text-white block">
                  100%
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#777777] dark:text-[#999999] font-medium">
                  Private Grounds
                </span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FCFBF9] dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-xs">
                <span className="font-sans text-xl sm:text-2xl font-bold text-[#202020] dark:text-white block">
                  24/7
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#777777] dark:text-[#999999] font-medium">
                  Dedicated Butler
                </span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FCFBF9] dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-xs">
                <span className="font-sans text-xl sm:text-2xl font-bold text-[#202020] dark:text-white block">
                  4.98★
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#777777] dark:text-[#999999] font-medium">
                  Guest Rating
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Storytelling */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFA1AA]/15 border border-[#EFA1AA]/30 text-[#202020] dark:text-white text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em]">
                <Sparkles className="w-3.5 h-3.5 text-[#EFA1AA]" />
                THE DARANGA STORY
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#202020] dark:text-white leading-[1.15] tracking-tight">
                A Haven of Privacy, Heritage &amp; Bespoke Luxury
              </h2>

              <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm leading-relaxed font-light pt-1">
                Conceived in the scenic valleys of Udaipur, Daranga Villa was created for travelers seeking unhurried elegance, soaring architecture, and genuine personal hospitality.
              </p>

              <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm leading-relaxed font-light">
                Whether celebrating special milestones, gathering for an intimate family reunion, or unwinding poolside in quietude, each residence offers a private sanctuary away from the world.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="space-y-3 pt-2">
              {pillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#FCFBF9] dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-xs hover:border-[#202020] dark:hover:border-white transition-colors"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#DDEEFF] dark:bg-[#2A2A2A] flex items-center justify-center text-[#202020] dark:text-white flex-shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-sans font-semibold text-xs sm:text-sm text-[#202020] dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-[#555555] dark:text-[#BDBDBD] text-[11px] sm:text-xs font-light leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/villas"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#202020] hover:bg-[#171717] text-white dark:bg-white dark:text-[#202020] dark:hover:bg-stone-200 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Explore All Sanctuaries</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
