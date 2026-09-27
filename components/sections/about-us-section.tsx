import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowRight, ShieldCheck, Bell, Utensils, Mountain } from "lucide-react";

export function AboutUsSection() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "Complete Seclusion",
      description: "Gated estate grounds ensuring absolute privacy and tranquility for your loved ones.",
    },
    {
      icon: Bell,
      title: "Bespoke Hospitality",
      description: "Dedicated 24/7 butler assistance and personalized concierge for every detail of your stay.",
    },
    {
      icon: Utensils,
      title: "Curated Private Dining",
      description: "Multi-course gourmet spreads crafted by master chefs using fresh, organic local produce.",
    },
    {
      icon: Mountain,
      title: "Exclusive Location",
      description: "Situated amidst Udaipur's peaceful natural valleys with breathtaking sunset vantage points.",
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-32 bg-[#FCFBF8] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border-y border-[#E8E6E2] dark:border-[#383633]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Brand Story & Values */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8A0A8]/10 border border-[#E8A0A8]/30 text-[#202020] dark:text-[#FCFBF8] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.25em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B99A62]" />
                ABOUT DARANGA VILLA
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#202020] dark:text-[#FCFBF8] leading-[1.14] tracking-tight">
                A Haven of Privacy, Serenity &amp; Bespoke Luxury.
              </h2>
              <p className="text-[#66635F] dark:text-[#BDB8B0] text-xs sm:text-sm leading-relaxed font-light pt-1">
                Daranga Villa was conceived as an exclusive sanctuary for travelers seeking unhurried elegance, architectural purity, and uncompromised personal hospitality in the tranquil valleys of Udaipur.
              </p>
              <p className="text-[#66635F] dark:text-[#BDB8B0] text-xs sm:text-sm leading-relaxed font-light">
                Whether celebrating milestone occasions, seeking a restorative family holiday, or indulging in a private couple’s escape, every residence is crafted to offer an unforgettable sanctuary away from the world.
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8E6E2] dark:border-[#383633]">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-[8px] bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] hover:border-[#B99A62]/50 transition-all duration-300 space-y-2.5 group shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-[6px] bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] flex items-center justify-center text-[#202020] dark:text-[#FCFBF8] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#B99A62]" />
                    </div>
                    <h3 className="font-serif text-base font-normal text-[#202020] dark:text-[#FCFBF8] group-hover:text-[#B99A62] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[#66635F] dark:text-[#BDB8B0] text-[11px] sm:text-xs leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/villas"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF8] dark:text-[#202020] dark:hover:bg-white text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] transition-all shadow-xs hover:shadow-md"
              >
                <span>EXPLORE ALL RESIDENCES</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Showcase & Brand Quote */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full bg-[#F7F6F3] dark:bg-[#171717] overflow-hidden shadow-lg rounded-[8px] border border-[#E8E6E2] dark:border-[#383633] group">
              <Image
                src="/images/hero/heroimg.webp"
                alt="Daranga Villa Sanctuary Estate"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Quote Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 sm:p-6 bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-[6px] shadow-2xl">
                <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-[#B99A62] block mb-1">
                  OUR COMMITMENT
                </span>
                <p className="font-serif text-sm sm:text-base italic font-light leading-snug">
                  &ldquo;Privacy is the ultimate luxury. We create timeless moments where you can truly slow down and unwind.&rdquo;
                </p>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 rounded-[8px] bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] text-center shadow-xs">
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#B99A62] block">
                  100%
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#66635F] dark:text-[#8A8782] font-medium">
                  Private Grounds
                </span>
              </div>
              <div className="border-x border-[#E8E6E2] dark:border-[#383633]">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#B99A62] block">
                  24/7
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#66635F] dark:text-[#8A8782] font-medium">
                  Butler Service
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#B99A62] block">
                  5★
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#66635F] dark:text-[#8A8782] font-medium">
                  Hospitality
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
