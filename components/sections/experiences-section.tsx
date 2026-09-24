import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";

export function ExperiencesSection() {
  const experiences = [
    {
      title: "Illuminated Pool & Private Lawn Evenings",
      subtitle: "🌙 PRIVATE POOL & STARLIT NIGHTS",
      description:
        "Enjoy tranquil evenings beside your private illuminated swimming pool and verdant garden lawn, complete with poolside dining and ambient villa lighting.",
      image: "/images/experiences/poolside-night.jpg",
    },
    {
      title: "Serene Balcony & Mountain Overlook",
      subtitle: "🌅 SCENIC BALCONY & VALLEY VIEWS",
      description:
        "Begin your day with morning tea from plush pink velvet terrace seating, breathing in fresh mountain air with panoramic views of Udaipur's scenic hills.",
      image: "/images/experiences/balcony-view.jpg",
    },
    {
      title: "Bespoke Master Bedrooms & Lounge",
      subtitle: "🛏️ LUXURY MASTER SUITES & COMFORT",
      description:
        "Unwind in spacious, soaring-ceiling master suites crafted with king-sized bedding, comfortable lounge seating, climate control, and artisanal finishes.",
      image: "/images/experiences/bedroom-suite.jpg",
    },
  ];

  return (
    <section id="experiences" className="py-24 lg:py-36 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] block">
            CURATED MOMENTS
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
            Tailored Resort Experiences.
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-light leading-relaxed">
            From intimate starlit celebrations to restorative morning rituals, our concierge ensures every moment is uniquely crafted.
          </p>
        </div>

        {/* Alternating Photo Showcase */}
        <div className="space-y-20 lg:space-y-28">
          {experiences.map((exp, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
              >
                {/* Photo Column */}
                <div
                  className={`lg:col-span-7 ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full bg-[var(--bg-secondary)] overflow-hidden rounded-[6px] border border-[var(--border-color)] shadow-2xl group">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/60 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Content Column */}
                <div
                  className={`lg:col-span-5 space-y-4 ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] block">
                    {exp.subtitle}
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                    {exp.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-light leading-relaxed pt-1">
                    {exp.description}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block border-b border-[var(--accent)] text-[var(--accent)] text-xs uppercase tracking-[0.2em] font-medium py-1">
                      Experience Concierge &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
