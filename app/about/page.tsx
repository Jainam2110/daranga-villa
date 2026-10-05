import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, UtensilsCrossed, Crown, Award, Clock } from "lucide-react";
import { DarangaStandardSection } from "@/components/sections/daranga-standard-section";
import { TrustedPartnerSection } from "@/components/sections/trusted-partner-section";

import { getCanonicalUrl, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us | Daranga Villas Udaipur",
  description:
    "Discover the story, vision, and timeless heritage behind Daranga Villas' private luxury sanctuaries in Udaipur.",
  alternates: {
    canonical: getCanonicalUrl("/about"),
  },
  openGraph: {
    title: "About Us | Daranga Villas Udaipur",
    description:
      "Discover the story, vision, and timeless heritage behind Daranga Villas' private luxury sanctuaries in Udaipur.",
    url: getCanonicalUrl("/about"),
    siteName: "Daranga Villas",
    images: [
      {
        url: `${getSiteUrl()}/images/hero/heroimg.webp`,
        width: 1200,
        height: 630,
        alt: "About Daranga Villas Udaipur",
      },
    ],
  },
};


export default function AboutPage() {
  const brandPillars = [
    {
      icon: Crown,
      title: "Royal Mewari Serenity",
      description: "Architecture inspired by timeless Rajasthani heritage, soaring arched ceilings, and handcrafted local stone.",
    },
    {
      icon: ShieldCheck,
      title: "100% Gated Seclusion",
      description: "Complete perimeter privacy ensuring you and your loved ones enjoy uninterrupted peace without compromise.",
    },
    {
      icon: HeartHandshake,
      title: "24/7 Dedicated Butler Care",
      description: "Discrete, intuitive hospitality designed to attend to every request, from morning tea to evening starlit setups.",
    },
    {
      icon: UtensilsCrossed,
      title: "Bespoke Culinary Artistry",
      description: "Multi-course gourmet fare, poolside live grills, and artisanal breakfast prepared fresh by master private chefs.",
    },
    {
      icon: Award,
      title: "Uncompromising Quality",
      description: "Every estate is vetted with meticulous 100-point inspection standards for pristine cleanliness and luxury comfort.",
    },
    {
      icon: Clock,
      title: "Unhurried Living",
      description: "A sanctuary crafted to help you disconnect from the rush of modern life and reconnect with what truly matters.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF9] dark:bg-[#171717] font-sans text-[#202020] dark:text-[#FCFBF8] selection:bg-[#EFA1AA] selection:text-[#202020]">
      {/* 1. Header */}
      <Navbar />

      <main className="flex-1 pt-16 sm:pt-20">
        {/* 2. Hero Header */}
        <section className="py-8 sm:py-12 text-center">
          <Container>
            <div className="max-w-3xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFA1AA]/15 dark:bg-[#EFA1AA]/20 border border-[#EFA1AA]/30 text-[#202020] dark:text-[#FCFBF8] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5 text-[#EFA1AA]" />
                THE DARANGA HERITAGE
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#202020] dark:text-[#FCFBF8] tracking-tight leading-[1.12]">
                Where Timeless Heritage Meets Private Luxury
              </h1>

              <p className="text-[#555555] dark:text-[#BDBDBD] text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
                Born amidst Udaipur&apos;s serene valley landscapes, Daranga Villa redefines private retreat hospitality through architectural purity, complete seclusion, and personalized service.
              </p>
            </div>
          </Container>
        </section>

        {/* 3. Story Visual Section */}
        <section className="py-6 sm:py-10">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              {/* Image */}
              <div className="lg:col-span-7">
                <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-[#202020] shadow-2xl border border-[#E8E8E8] dark:border-[#383838]">
                  <Image
                    src="/images/hero/heroimg.webp"
                    alt="Daranga Villa Estate Udaipur"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 sm:p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
                    <p className="font-serif text-base sm:text-lg italic font-light">
                      &ldquo;We created Daranga Villa as a sanctuary where time slows down and every moment feels like an intimate celebration.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Story Narrative */}
              <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#EFA1AA] tracking-[0.25em]">
                    OUR VISION
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#202020] dark:text-[#FCFBF8] leading-tight">
                    Crafted for Unhurried Elegance
                  </h2>
                </div>

                <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm font-light leading-relaxed">
                  Unlike traditional hotels, our private residences offer expansive private grounds, temperature-controlled swimming pools, and dedicated in-villa staff.
                </p>

                <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm font-light leading-relaxed">
                  From sunrise tea overlooking the Aravalli hills to starlit poolside dinners prepared by your private chef, every experience is curated exclusively for your group.
                </p>

                <div className="pt-2">
                  <Link
                    href="/villas"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#202020] hover:bg-[#171717] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>View Our Sanctuaries</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* 4. Brand Pillars Grid */}
        <section className="py-10 sm:py-14 bg-white/70 dark:bg-[#1E1E1E]/50 border-y border-[#E8E8E8] dark:border-[#383838]">
          <Container>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-6 sm:mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EFA1AA] block">
                OUR PILLARS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF8] tracking-tight">
                The Standard of Excellence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {brandPillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-xs hover:shadow-md hover:border-[#202020] dark:hover:border-[#E8E8E8] transition-all duration-300 space-y-3 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#DDEEFF]/40 dark:bg-[#171717] border border-[#DDEEFF] dark:border-[#383838] flex items-center justify-center text-[#202020] dark:text-[#FCFBF8] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-sans font-semibold text-base text-[#202020] dark:text-[#FCFBF8] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* 5. The Daranga Standard Showcase */}
        <DarangaStandardSection />

        {/* 6. Trusted Partner Section */}
        <TrustedPartnerSection />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
