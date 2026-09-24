import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Shield, Sparkles, Utensils, Compass, ArrowRight } from "lucide-react";

export function AboutUsSection() {
  const highlights = [
    {
      icon: Shield,
      title: "Complete Seclusion",
      description: "Gated estate grounds ensuring absolute privacy and tranquility for your loved ones.",
    },
    {
      icon: Sparkles,
      title: "Bespoke Hospitality",
      description: "Dedicated 24/7 butler assistance and personalized concierge for every detail of your stay.",
    },
    {
      icon: Utensils,
      title: "Curated Private Dining",
      description: "Multi-course gourmet spreads crafted by master chefs using fresh, organic local produce.",
    },
    {
      icon: Compass,
      title: "Exclusive Location",
      description: "Situated amidst Udaipur's peaceful natural valleys with breathtaking sunset vantage points.",
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-32 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-y border-[var(--border-color)]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Brand Story & Values */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.25em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                ABOUT DARANGA VILLA
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--text-primary)] leading-[1.14] tracking-tight">
                A Haven of Privacy, Serenity &amp; Bespoke Luxury.
              </h2>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed font-light pt-1">
                Daranga Villa was conceived as an exclusive sanctuary for travelers seeking unhurried elegance, architectural purity, and uncompromised personal hospitality in the tranquil valleys of Udaipur.
              </p>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed font-light">
                Whether celebrating milestone occasions, seeking a restorative family holiday, or indulging in a private couple’s escape, every residence is crafted to offer an unforgettable sanctuary away from the world.
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--bg-primary)]/60 border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all duration-300 space-y-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-base font-normal text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-[11px] sm:text-xs leading-relaxed font-light">
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
                className="btn-luxury-shimmer inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <span>EXPLORE ALL RESIDENCES</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Showcase & Brand Quote */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full bg-[var(--bg-primary)] overflow-hidden shadow-2xl rounded-2xl border border-[var(--border-color)] group">
              <Image
                src="/images/hero/heroimg.webp"
                alt="Daranga Villa Sanctuary Estate"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Quote Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 sm:p-6 bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-2xl">
                <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-[var(--accent)] block mb-1">
                  OUR COMMITMENT
                </span>
                <p className="font-serif text-sm sm:text-base italic font-light leading-snug">
                  &ldquo;Privacy is the ultimate luxury. We create timeless moments where you can truly slow down and unwind.&rdquo;
                </p>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] text-center">
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--accent)] block">
                  100%
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                  Private Grounds
                </span>
              </div>
              <div className="border-x border-[var(--border-color)]">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--accent)] block">
                  24/7
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                  Butler Service
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--accent)] block">
                  5★
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">
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
