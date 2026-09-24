import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";

export function ExperiencesSection() {
  const experiences = [
    {
      title: "PRIVATE MOMENTS & SUNSET HOURS",
      subtitle: "Bespoke Culinary Journeys",
      description:
        "Enjoy candles lit along private pool terraces while our master chefs serve multi-course Indian and international menus prepared with locally sourced organic produce.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2070&q=85",
    },
    {
      title: "SLOW MORNINGS & REVITALIZATION",
      subtitle: "Mindful Revival",
      description:
        "Begin your day with guided sunrise yoga, personalized spa therapies, and floating breakfast spreads served right in your private infinity pool.",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2080&q=85",
    },
    {
      title: "LOCAL EXPERIENCES & NATURE",
      subtitle: "Curated Estate Excursions",
      description:
        "Explore private trails, secluded estate vantage points, and cultural landmarks accompanied by private estate guides.",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2070&q=85",
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
