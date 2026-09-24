"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedVillasSection } from "@/components/sections/featured-villas-section";
import { AboutUsSection } from "@/components/sections/about-us-section";
import { ExperiencesSection } from "@/components/sections/experiences-section";
import { BookingCtaSection } from "@/components/sections/booking-cta-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Villa } from "@/types/villa";
import { getPrimaryVillaImageUrl } from "@/lib/utils/image";

interface HomePageClientProps {
  villas: Villa[];
}

export function HomePageClient({ villas }: HomePageClientProps) {
  const router = useRouter();

  // Shared Availability Booking State (Powers both landing search bar and sticky header)
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
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-[var(--bg-primary)]">
      {/* 1. Header (State 1: Transparent over hero | State 2: Sticky availability header on scroll) */}
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
        {/* 2. Full-Screen Cinematic 5-Second Hero Image Slideshow */}
        <HeroSection
          heroImages={heroImages}
          onExploreClick={handleScrollToVillas}
        />

        {/* 3. Featured Villas Section */}
        <FeaturedVillasSection
          villas={villas}
          onSelectVilla={handleSelectVilla}
        />

        {/* 4. Curated Resort Experiences */}
        <ScrollReveal delay={100} direction="up">
          <ExperiencesSection />
        </ScrollReveal>

        {/* 5. About Us Section (Story & Values) */}
        <ScrollReveal delay={100} direction="up">
          <AboutUsSection />
        </ScrollReveal>

        {/* 6. Final Reservation CTA Banner */}
        <ScrollReveal delay={100} direction="up">
          <BookingCtaSection
            onCheckAvailabilityClick={handleScrollToVillas}
          />
        </ScrollReveal>
      </main>

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
