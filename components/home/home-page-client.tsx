"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { HeroSearchBar } from "@/components/sections/hero-search-bar";
import { ExperienceCategoriesSection, EXPERIENCE_CATEGORIES } from "@/components/sections/experience-categories-section";
import { TrustedPartnerSection } from "@/components/sections/trusted-partner-section";
import { DarangaStandardSection } from "@/components/sections/daranga-standard-section";
import { PromotionalStrip } from "@/components/ui/promotional-strip";
import { FeaturedVillasSection } from "@/components/sections/featured-villas-section";
import { AboutUsSection } from "@/components/sections/about-us-section";
import { AboutUdaipurHomeSection } from "@/components/sections/about-udaipur-home-section";
import { ExperiencesSection } from "@/components/sections/experiences-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Villa } from "@/types/villa";
import { getPrimaryVillaImageUrl } from "@/lib/utils/image";
import { HeroSlideData } from "@/lib/api/hero-slides";

interface HomePageClientProps {
  villas: Villa[];
  customHeroSlides?: HeroSlideData[];
}

export function HomePageClient({ villas, customHeroSlides }: HomePageClientProps) {
  const router = useRouter();

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Shared Availability Booking State
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);

  const handleScrollToVillas = () => {
    const el = document.getElementById("villas");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/villas");
    }
  };

  const handleSelectDates = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleSelectGuests = (newGuests: number) => {
    setGuests(newGuests);
  };

  const handleCheckAvailabilityAction = () => {
    handleScrollToVillas();
  };

  const handleSelectVilla = (villaId: string) => {
    const target = villas.find((v) => (v.id || v._id) === villaId);
    const slug = target?.slug || target?.id || villaId;
    router.push(`/villas/${slug}`);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  // Filter villas based on both search query and selected experience category
  const filteredVillas = useMemo(() => {
    let result = [...villas];

    // 1. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((v) => {
        const name = (v.name || "").toLowerCase();
        const desc = (v.description || "").toLowerCase();
        const tagline = (v.tagline || "").toLowerCase();
        const loc = typeof v.location === "string" ? v.location.toLowerCase() : (v.location?.address || "").toLowerCase();
        const amenitiesStr = Array.isArray(v.amenities) ? v.amenities.join(" ").toLowerCase() : "";
        const highlightsStr = Array.isArray(v.highlights) ? v.highlights.join(" ").toLowerCase() : "";
        const bhk = `${v.bedrooms || ""} bhk`.toLowerCase();

        return (
          name.includes(q) ||
          desc.includes(q) ||
          tagline.includes(q) ||
          loc.includes(q) ||
          amenitiesStr.includes(q) ||
          highlightsStr.includes(q) ||
          bhk.includes(q) ||
          q.includes("udaipur") // if query is just "udaipur", all belong to Udaipur
        );
      });
    }

    // 2. Filter by Experience Category
    if (selectedCategory) {
      const catConfig = EXPERIENCE_CATEGORIES.find((c) => c.id === selectedCategory);
      if (catConfig) {
        const keywords = catConfig.keywords;
        result = result.filter((v) => {
          const combined = [
            v.name,
            v.description,
            v.tagline,
            ...(Array.isArray(v.amenities) ? v.amenities : []),
            ...(Array.isArray(v.highlights) ? v.highlights : []),
          ]
            .join(" ")
            .toLowerCase();

          return keywords.some((kw) => combined.includes(kw));
        });
      }
    }

    return result;
  }, [villas, searchQuery, selectedCategory]);

  // Active filter label for user feedback
  const activeFilterLabel = useMemo(() => {
    const parts: string[] = [];
    if (searchQuery.trim()) parts.push(`"${searchQuery.trim()}"`);
    if (selectedCategory) {
      const cat = EXPERIENCE_CATEGORIES.find((c) => c.id === selectedCategory);
      if (cat) parts.push(cat.name);
    }
    return parts.length > 0 ? parts.join(" • ") : null;
  }, [searchQuery, selectedCategory]);

  // Collect high-res hero images across active villas
  const heroImages = useMemo(() => {
    const images: string[] = ["/images/hero/heroimg.webp"];
    villas.forEach((v) => {
      const primary = getPrimaryVillaImageUrl(v.images);
      if (primary && !images.includes(primary)) {
        images.push(primary);
      }
      if (Array.isArray(v.images)) {
        v.images.forEach((img) => {
          if (typeof img === "string" && img.startsWith("http") && !images.includes(img)) {
            images.push(img);
          } else if (img && typeof img === "object" && "url" in img) {
            const u = (img as { url: string }).url;
            if (u && u.startsWith("http") && !images.includes(u)) {
              images.push(u);
            }
          }
        });
      }
    });
    // Ensure we have up to 5 diverse slides
    return images.slice(0, 5);
  }, [villas]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#171717] font-sans text-[#202020] dark:text-white selection:bg-[#F6C7CA] selection:text-[#202020]">
      {/* 1. Header with Call Us button on top right & menu */}
      <Navbar
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        onSelectDates={handleSelectDates}
        onSelectGuests={handleSelectGuests}
        onCheckAvailability={handleCheckAvailabilityAction}
        onReserveClick={handleScrollToVillas}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Full-Screen / Cinematic Hero Slideshow */}
        <HeroSection
          heroImages={heroImages}
          customHeroSlides={customHeroSlides}
        />

        {/* 3. Search Bar (Overlapping bottom edge of hero) */}
        <div className="relative -mt-6 sm:-mt-8 z-30">
          <HeroSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleScrollToVillas}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onSelectDates={handleSelectDates}
            onSelectGuests={handleSelectGuests}
          />
        </div>

        {/* 4. Curated Udaipur Experiences Section (Replacing "Pick a Destination") */}
        <ExperienceCategoriesSection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 5. Soft Luxury Promotional / Offer Strip */}
        <PromotionalStrip
          message="Direct Booking Privilege • Complimentary artisanal breakfast & bespoke concierge hospitality with every stay"
          ctaText="Explore Sanctuaries"
          ctaHref="/villas"
        />

        {/* 6. Featured Villas Section (Receives Live Filtered Results) */}
        <FeaturedVillasSection
          villas={filteredVillas}
          onSelectVilla={handleSelectVilla}
          activeFilter={activeFilterLabel}
          onClearFilter={handleClearAllFilters}
        />

        {/* 7. The Daranga Standard Showcase (Signature Hospitality Features) */}
        <ScrollReveal delay={100} direction="up">
          <DarangaStandardSection />
        </ScrollReveal>

        {/* 8. Curated Resort Experiences (3D Cube Auto-Slider) */}
        <ScrollReveal delay={100} direction="up">
          <ExperiencesSection />
        </ScrollReveal>

        {/* 9. Your Trusted Getaway Partner (3 Cards) */}
        <ScrollReveal delay={100} direction="up">
          <TrustedPartnerSection />
        </ScrollReveal>

        {/* 10. About Udaipur Destination Banner (Just before Our Philosophy) */}
        <ScrollReveal delay={100} direction="up">
          <AboutUdaipurHomeSection />
        </ScrollReveal>

        {/* 11. About Us Section (OUR PHILOSOPHY) */}
        <ScrollReveal delay={100} direction="up">
          <AboutUsSection />
        </ScrollReveal>
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
