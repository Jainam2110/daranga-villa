import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import {
  Sparkles,
  Compass,
  MapPin,
  Camera,
  Crown,
  Sun,
  Waves,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { getCanonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Udaipur — City of Lakes & Luxury Travel | Daranga Villas",
  description:
    "Immerse yourself in Udaipur's royal heritage, iconic lakes, and majestic palaces. Experience the destination in private luxury with Daranga Villas.",
  alternates: {
    canonical: getCanonicalUrl("/about-udaipur"),
  },
  openGraph: {
    title: "About Udaipur — City of Lakes & Luxury Travel | Daranga Villas",
    description:
      "Immerse yourself in Udaipur's royal heritage, iconic lakes, and majestic palaces. Experience the destination in private luxury with Daranga Villas.",
    url: getCanonicalUrl("/about-udaipur"),
    siteName: "Daranga Villas",
    images: [
      {
        url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85",
        width: 1200,
        height: 630,
        alt: "Udaipur Lake Pichola & City Palace View",
      },
    ],
  },
};

/**
 * Editorial Destination Showcase Data
 * Structured cleanly for future client image swaps.
 */
const DESTINATION_GALLERY = [
  {
    id: "lake-pichola",
    title: "Lake Pichola",
    tagline: "ROYAL WATERWAYS",
    subtitle: "Tranquil waters reflecting Mewari architectural grandeur",
    image: "https://images.unsplash.com/photo-1699949958644-64499c608946?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    aspect: "aspect-[16/10]",
    highlight: "Sunset boat cruises & starlit palace reflections",
  },
  {
    id: "city-palace",
    title: "The City Palace",
    tagline: "HERITAGE MONOLITH",
    subtitle: "Four centuries of Mewari craftsmanship and royal pavilions",
    image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1600&q=85",
    aspect: "aspect-[4/3]",
    highlight: "Intricate marble archways and sunlit courtyards",
  },
  {
    id: "monsoon-palace",
    title: "Sajjangarh Monsoon Palace",
    tagline: "ARAVALLI SKYLINE",
    subtitle: "Perched high above the clouds overlooking the lake valley",
    image: "https://images.unsplash.com/photo-1723118580337-8ba9d8f58820?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    aspect: "aspect-[4/3]",
    highlight: "Panoramic sunset views across the entire city",
  },
  {
    id: "old-city",
    title: "Udaipur Old City",
    tagline: "CULTURAL TAPESTRY",
    subtitle: "Cobblestone alleys, silver bazaars, and miniature paintings",
    image: "https://plus.unsplash.com/premium_photo-1726790405327-3fcd26a15287?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    aspect: "aspect-[16/10]",
    highlight: "Authentic Rajasthani culture and local heritage",
  },
];

const DESTINATION_HIGHLIGHTS = [
  {
    icon: Waves,
    number: "01",
    title: "Venetian Lake Valleys",
    caption: "Five interconnected glacial & artificial lakes surrounding green Aravalli hills.",
  },
  {
    icon: Landmark,
    number: "02",
    title: "450+ Years of Royalty",
    caption: "Historic capital of the Mewar Kingdom with pristine preserved heritage architecture.",
  },
  {
    icon: Crown,
    number: "03",
    title: "World's #1 Romantic Destination",
    caption: "Renowned globally for romantic sunsets, lakefront dining, and luxury travel.",
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Secluded Private Sanctuaries",
    caption: "Daranga Villa offers private gated residences minutes from Udaipur's core.",
  },
];

export default function AboutUdaipurPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF9] dark:bg-[#171717] font-sans text-[#202020] dark:text-[#FCFBF8] selection:bg-[#EFA1AA] selection:text-[#202020]">
      {/* 1. Header Navigation */}
      <Navbar />

      <main className="flex-1 pt-16 sm:pt-20">
        {/* 2. Editorial Magazine Hero Section */}
        <section className="relative h-[68vh] sm:h-[78vh] min-h-[480px] sm:min-h-[580px] w-full flex items-center justify-center overflow-hidden rounded-b-[28px] sm:rounded-b-[40px] bg-[#171717]">
          {/* Background Tourism Hero Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85"
              alt="Udaipur City of Lakes Panorama"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_35%] filter brightness-[0.82] transition-transform duration-1000 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />
            <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/50" />
          </div>

          {/* Hero Editorial Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-4 sm:space-y-6 pt-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[#EFA1AA] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5 text-[#EFA1AA]" />
              LUXURY DESTINATION EDITORIAL • RAJASTHAN
            </span>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-white drop-shadow-2xl tracking-tight leading-[1.08]">
              Udaipur
            </h1>

            <p className="font-serif italic text-lg sm:text-2xl text-stone-200 font-light max-w-2xl mx-auto drop-shadow-md">
              &ldquo;The City of Lakes — Where Royal Legacy Meets Serene Waters.&rdquo;
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <span className="text-xs uppercase font-semibold text-white/80 tracking-[0.2em] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#EFA1AA]" />
                <span>Udaipur, Rajasthan, India</span>
              </span>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/60">
            <span className="text-[9px] uppercase tracking-[0.25em] font-mono">SCROLL TO EXPLORE</span>
            <div className="w-0.5 h-6 bg-gradient-to-b from-white to-transparent animate-pulse" />
          </div>
        </section>

        {/* 3. Visual Intro & Editorial Narrative */}
        <section className="py-12 sm:py-20">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Text Narrative */}
              <div className="lg:col-span-5 space-y-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EFA1AA] flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[#EFA1AA]" />
                  <span>THE DESTINATION EXPERIENCE</span>
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#202020] dark:text-[#FCFBF8] leading-tight">
                  A Royal Jewel Enveloped in Azure Lakes
                </h2>

                <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm font-light leading-relaxed">
                  Founded in 1559 by Maharana Udai Singh II, Udaipur is celebrated worldwide as India&apos;s most romantic destination. Surrounded by the emerald peaks of the Aravalli range and shimmering lake waters, it offers an unhurried tempo of living.
                </p>

                <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm font-light leading-relaxed">
                  From sunlit marble courtyards to tranquil twilight boat rides, Udaipur seamlessly combines timeless royal grandeur with serene natural beauty.
                </p>

                {/* Key Facts Pill Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838]">
                    <div className="text-[10px] font-mono uppercase font-bold text-[#EFA1AA]">FOUNDED</div>
                    <div className="font-serif text-base font-semibold text-[#202020] dark:text-[#FCFBF8] mt-0.5">
                      1559 AD
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838]">
                    <div className="text-[10px] font-mono uppercase font-bold text-[#EFA1AA]">ELEVATION</div>
                    <div className="font-serif text-base font-semibold text-[#202020] dark:text-[#FCFBF8] mt-0.5">
                      598 Meters
                    </div>
                  </div>
                </div>
              </div>

              {/* Layered Composition Image Cards */}
              <div className="lg:col-span-7 relative">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xl border border-[#E8E8E8] dark:border-[#383838] group">
                    <Image
                      src="https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1000&q=85"
                      alt="City Palace Marble Arches"
                      fill
                      sizes="(max-width: 1024px) 50vw, 35vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[9px] font-mono uppercase font-bold text-[#EFA1AA] tracking-widest block">
                        ARCHITECTURE
                      </span>
                      <span className="font-serif text-sm font-medium">Marble Pavilions & Arches</span>
                    </div>
                  </div>

                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xl border border-[#E8E8E8] dark:border-[#383838] group mt-6 sm:mt-10">
                    <Image
                      src="https://images.unsplash.com/photo-1719041250205-bb19f221c9b2?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Udaipur Sunset over Hills"
                      fill
                      sizes="(max-width: 1024px) 50vw, 35vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[9px] font-mono uppercase font-bold text-[#EFA1AA] tracking-widest block">
                        SUNSETS
                      </span>
                      <span className="font-serif text-sm font-medium">Aravalli Twilight Glow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* 4. Large Editorial Travel Gallery (Image-Focused) */}
        <section className="py-12 sm:py-16 bg-white/60 dark:bg-[#1E1E1E]/40 border-y border-[#E8E8E8] dark:border-[#383838]">
          <Container>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EFA1AA] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#EFA1AA]" />
                  <span>EDITORIAL DESTINATION GALLERY</span>
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF8] tracking-tight">
                  Capturing Udaipur&apos;s Essence
                </h2>
              </div>
              <p className="text-xs text-[#555555] dark:text-[#BDBDBD] max-w-sm font-light leading-relaxed">
                Short visual vignettes showcasing iconic landmarks across Udaipur&apos;s water, heritage, and hillside landscapes.
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {DESTINATION_GALLERY.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-3xl overflow-hidden bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  <div className={`relative ${item.aspect} w-full overflow-hidden`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.92]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[#EFA1AA] text-[9px] font-mono font-bold tracking-[0.2em] uppercase">
                        {item.tagline}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal drop-shadow-md">
                        {item.title}
                      </h3>
                      <p className="text-stone-200 text-xs font-light max-w-md line-clamp-2">
                        {item.subtitle}
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[11px] text-[#EFA1AA] font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{item.highlight}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* 5. Destination Pillars Grid */}
        <section className="py-12 sm:py-16">
          <Container>
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EFA1AA] block">
                WHY VISIT UDAIPUR
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF8] tracking-tight">
                The Luxury Travel Standard
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {DESTINATION_HIGHLIGHTS.map((h, i) => {
                const Icon = h.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-xs hover:border-[#202020] dark:hover:border-[#E8E8E8] transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#DDEEFF]/40 dark:bg-[#171717] border border-[#DDEEFF] dark:border-[#383838] flex items-center justify-center text-[#202020] dark:text-white group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4 text-[#202020] dark:text-[#FCFBF8]" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#EFA1AA]">
                        {h.number}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-[#202020] dark:text-[#FCFBF8]">
                      {h.title}
                    </h3>
                    <p className="text-xs text-[#555555] dark:text-[#BDBDBD] font-light leading-relaxed">
                      {h.caption}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* 6. The Daranga Villas Connection */}
        <section className="py-12 sm:py-16 bg-[#202020] text-white relative overflow-hidden rounded-3xl mx-4 sm:mx-8 mb-12 border border-white/10 shadow-2xl">
          <div className="absolute inset-0 z-0 opacity-25">
            <Image
              src="/images/villas/WhatsApp Image 2026-10-05 at 12.10.38 (1).jpeg"
              alt="Daranga Villa Udaipur Sanctuary"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <Container className="relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#EFA1AA] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em]">
                <Sun className="w-3.5 h-3.5 text-[#EFA1AA]" />
                STAY AT DARANGA VILLAS UDAIPUR
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-tight">
                Your Private villas in the City of Lakes
              </h2>

              <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto">
                Explore Udaipur&apos;s grand heritage by day, and return to complete gated seclusion, private infinity pools, and 24/7 dedicated butler service by night.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/villas"
                  className="px-8 py-3.5 rounded-full bg-white text-[#202020] hover:bg-stone-200 text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Explore Sanctuaries
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-3.5 rounded-full border border-white/40 hover:border-white text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all hover:bg-white/10 cursor-pointer"
                >
                  About Our Brand
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
