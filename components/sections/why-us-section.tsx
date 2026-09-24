import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { AmenityIcon } from "@/components/ui/amenity-icon";

export function WhyUsSection() {
  const pillars = [
    {
      num: "01",
      title: "Total Privacy",
      description:
        "Secluded grounds and gated estate perimeters ensure uninterrupted serenity for families, executives, and couples.",
    },
    {
      num: "02",
      title: "Personalized Hospitality",
      description:
        "Dedicated butler assistance, private dining curated by master chefs, and 24/7 concierge support throughout your stay.",
    },
    {
      num: "03",
      title: "Scenic Natural Beauty",
      description:
        "Surrounded by pristine natural terrain and architectural landscaping with private infinity pools and sunset verandas.",
    },
    {
      num: "04",
      title: "Bespoke Itineraries",
      description:
        "Custom excursions, wellness rituals, floating breakfasts, and intimate celebrations crafted to your preferences.",
    },
  ];

  const signatureAmenities = [
    "Private Swimming Pools",
    "24/7 Concierge & Butler",
    "High-Speed Fiber Wi-Fi",
    "Chef-Grade Kitchens",
    "Central Climate Control",
    "Gated Estate Security",
    "Private Parking",
    "Panoramic Sun Decks",
  ];

  return (
    <section id="experience" className="py-24 lg:py-36 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-y border-[var(--border-color)]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Magazine Typography & Editorial Pillars */}
          <div className="lg:col-span-6 space-y-10">
            <div className="space-y-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] block">
                THE DARANGA PHILOSOPHY
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-[1.12] tracking-tight">
                More than a stay.<br />A place to slow down.
              </h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-light pt-1">
                Daranga Villa represents the pinnacle of private retreat hospitality. Every estate residence is meticulously maintained to provide an uncompromised sanctuary away from the world.
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
              {pillars.map((item) => (
                <div
                  key={item.num}
                  className="space-y-2 p-3.5 rounded-[6px] transition-all duration-300 hover:bg-[var(--bg-primary)]/50 border border-transparent hover:border-[var(--accent)]/30 group"
                >
                  <span className="font-serif text-lg font-normal text-[var(--accent)] group-hover:translate-x-1 transition-transform duration-300 inline-block">
                    {item.num}
                  </span>
                  <h3 className="font-serif text-xl font-normal text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Signature Amenities Quick Badges */}
            <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] block">
                Signature Estate Inclusions
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs text-[var(--text-secondary)]">
                {signatureAmenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <AmenityIcon name={amenity} className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
                    <span className="truncate font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Photo Framing */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] w-full bg-[var(--bg-primary)] overflow-hidden shadow-2xl rounded-[8px] border border-[var(--border-color)] group">
              <Image
                src="/images/hero/heroimg.webp"
                alt="Daranga Luxury Hospitality"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/75 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--accent)]/30 text-[var(--text-primary)] rounded-[6px]">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[var(--accent)] block mb-1">
                  Private Sanctuary
                </span>
                <p className="font-serif text-lg italic font-light text-[var(--text-primary)]">
                  &ldquo;Privacy is the ultimate luxury.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
