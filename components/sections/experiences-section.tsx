import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";

export function ExperiencesSection() {
  const experiences = [
    {
      title: "Illuminated Pool & Private Lawn Evenings",
      subtitle: "PRIVATE POOL & STARLIT NIGHTS",
      description:
        "Enjoy tranquil evenings beside your private illuminated swimming pool and verdant garden lawn, complete with poolside dining and ambient villa lighting.",
      image: "/images/experiences/poolside-night.jpg",
    },
    {
      title: "Serene Balcony & Mountain Overlook",
      subtitle: "SCENIC BALCONY & VALLEY VIEWS",
      description:
        "Begin your day with morning tea from plush terrace seating, breathing in fresh mountain air with panoramic views of Udaipur's scenic hills.",
      image: "/images/experiences/balcony-view.jpg",
    },
    {
      title: "Bespoke Master Bedrooms & Lounge",
      subtitle: "LUXURY MASTER SUITES & COMFORT",
      description:
        "Unwind in spacious, soaring-ceiling master suites crafted with king-sized bedding, comfortable lounge seating, climate control, and artisanal finishes.",
      image: "/images/experiences/bedroom-suite.jpg",
    },
  ];

  return (
    <section id="experiences" className="py-24 lg:py-32 bg-white dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8]">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B99A62] block">
            CURATED MOMENTS
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#202020] dark:text-[#FCFBF8] tracking-tight">
            Tailored Resort Experiences.
          </h2>
          <p className="text-[#66635F] dark:text-[#BDB8B0] text-sm font-light leading-relaxed">
            From intimate starlit celebrations to restorative morning rituals, our concierge ensures every moment is uniquely crafted.
          </p>
        </div>

        {/* Alternating Photo Showcase */}
        <div className="space-y-16 lg:space-y-24">
          {experiences.map((exp, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
              >
                {/* Photo Column */}
                <div
                  className={`lg:col-span-7 ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full bg-[#F7F6F3] dark:bg-[#202020] overflow-hidden rounded-[8px] border border-[#E8E6E2] dark:border-[#383633] shadow-md group">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Content Column */}
                <div
                  className={`lg:col-span-5 space-y-4 ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B99A62] block">
                    {exp.subtitle}
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#202020] dark:text-[#FCFBF8] tracking-tight">
                    {exp.title}
                  </h3>
                  <p className="text-[#66635F] dark:text-[#BDB8B0] text-xs sm:text-sm font-light leading-relaxed pt-1">
                    {exp.description}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block border-b border-[#B99A62] text-[#202020] dark:text-[#FCFBF8] hover:text-[#B99A62] text-xs uppercase tracking-[0.2em] font-medium py-1 transition-colors cursor-pointer">
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
