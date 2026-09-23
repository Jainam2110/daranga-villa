"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import {
  VillaBookingProvider,
  VillaCalendar,
  VillaBookingCard,
  MobileStickyBookingBar,
} from "@/components/villas/villa-booking-widget";
import { Lightbox } from "@/components/ui/lightbox";
import { VillaCardsCarousel } from "@/components/ui/villa-cards-carousel";
import { Villa } from "@/types/villa";
import { DEFAULT_VILLA_IMAGE } from "@/lib/constants";

interface VillaDetailClientProps {
  villa: Villa;
  relatedVillas?: Villa[];
}

export function VillaDetailClient({ villa, relatedVillas = [] }: VillaDetailClientProps) {
  // Extract all valid Cloudinary / fallback image URLs
  const rawImages =
    villa.images && villa.images.length > 0
      ? villa.images
      : [DEFAULT_VILLA_IMAGE];

  const imageUrls = rawImages
    .map((img) => {
      if (typeof img === "string") return img;
      if (img && typeof img === "object" && "url" in img) {
        return (img as { url: string }).url || DEFAULT_VILLA_IMAGE;
      }
      return DEFAULT_VILLA_IMAGE;
    })
    .filter(Boolean);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const thumbnailRowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    const container = thumbnailRowRef.current;
    if (!container) return;
    const activeThumbnail = container.children[activeImageIndex] as HTMLElement;
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeImageIndex]);

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
  };

  const handleSelectImage = (idx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex(idx);
  };

  const handleOpenLightbox = (idx?: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex(typeof idx === "number" ? idx : activeImageIndex);
    setIsLightboxOpen(true);
  };

  // Touch swiping gesture handlers for main image
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Share & Save state
  const [isSaved, setIsSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Handle Share action
  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${villa.name} | Daranga Villa`,
          text: villa.description || `Experience private luxury stay at ${villa.name}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share dialog
      }
    } else if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-[var(--bg-primary)]">
      <Navbar transparentOnTop={false} />

      <main className="flex-1 pt-16 sm:pt-20 pb-32 sm:pb-36 lg:pb-20">
        {/* 1. Dedicated Breadcrumb Row (Topmost) */}
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-4">
          <Container>
            <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)] font-medium">
              <Link href="/villas" className="hover:text-[var(--accent)] transition-colors">
                Villas
              </Link>
              <span>/</span>
              <span className="text-[var(--text-primary)] font-semibold">{villa.name}</span>
            </nav>
          </Container>
        </div>

        {/* 2. Villa Title & Property Header Section */}
        <div className="pt-8 sm:pt-10 pb-4">
          <Container>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Left Column: Title, Location, Specs */}
              <div className="space-y-3 max-w-3xl">
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] tracking-tight leading-tight break-words">
                  {villa.name}
                </h1>

                {/* Location directly below title */}
                <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{villa.location || "Daranga Estate Sanctuary"}</span>
                </p>

                {/* Property Specs */}
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-medium pt-1 flex flex-wrap items-center gap-2.5">
                  <span>{villa.maxGuests} guests</span>
                  <span className="text-[var(--border-color)]">•</span>
                  <span>{villa.bedrooms} bedrooms</span>
                  <span className="text-[var(--border-color)]">•</span>
                  <span>{villa.bathrooms} bathrooms</span>
                </div>
              </div>

              {/* Right Column: Share & Save Controls */}
              <div className="relative flex items-center gap-3 pt-2 lg:pt-1">
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  type="button"
                  className="px-4 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] text-xs font-medium text-[var(--text-primary)] flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" />
                  </svg>
                  <span>Share</span>
                </button>

                {/* Toast Notification */}
                {shareToast && (
                  <div className="absolute top-14 right-0 z-50 bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold px-3 py-1.5 rounded shadow-lg animate-in fade-in duration-150 whitespace-nowrap">
                    Link copied to clipboard!
                  </div>
                )}

                {/* Save Bookmark Button */}
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  type="button"
                  className={`px-4 py-2.5 border rounded-[6px] text-xs font-medium flex items-center gap-2 transition-colors ${isSaved
                      ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-primary)]"
                      : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-primary)]"
                    }`}
                >
                  <svg
                    className={`w-4 h-4 ${isSaved ? "fill-current" : "text-[var(--accent)]"}`}
                    fill={isSaved ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>
          </Container>
        </div>

        {/* 3. Cinema Interactive Image Slider & Thumbnail Filmstrip (Web & Mobile) */}
        <Container className="pt-4 sm:pt-6">
          <div className="space-y-3.5">
            {/* Main Stage Cinema Showcase */}
            <div
              className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px] xl:h-[620px] rounded-[12px] sm:rounded-[16px] overflow-hidden border border-[var(--border-color)] bg-[#151412] shadow-2xl group/stage select-none cursor-pointer"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => handleOpenLightbox(activeImageIndex)}
            >
              {/* Stacked Images for Ultra-Smooth Crossfade */}
              {imageUrls.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-out ${idx === activeImageIndex ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                    }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${villa.name} photograph ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 85vw"
                    className="object-cover transition-transform duration-1000 group-hover/stage:scale-105"
                  />
                </div>
              ))}

              {/* Ambient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 opacity-70 group-hover/stage:opacity-40 transition-opacity duration-500 z-10" />

              {/* Top Left Tag Badge */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 pointer-events-none">
                <span className="px-3.5 py-1.5 bg-[var(--bg-primary)]/90 text-[var(--accent)] text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold border border-[var(--accent)]/30 backdrop-blur-md rounded-[4px] shadow-md">
                  Exclusive Sanctuary • {villa.location || "Daranga Estate"}
                </span>
              </div>

              {/* Top Right Counter Badge */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 pointer-events-none">
                <span className="px-3 py-1 sm:py-1.5 bg-black/60 backdrop-blur-md text-stone-200 text-xs sm:text-sm font-mono tracking-wider font-medium rounded-[6px] border border-white/15 shadow-md flex items-center gap-1.5">
                  <span>{activeImageIndex + 1} / {imageUrls.length}</span>
                </span>
              </div>

              {/* Previous Arrow Button */}
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] flex items-center justify-center transition-all duration-200 shadow-xl opacity-90 sm:opacity-0 group-hover/stage:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Next Arrow Button */}
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] flex items-center justify-center transition-all duration-200 shadow-xl opacity-90 sm:opacity-0 group-hover/stage:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Bottom Right Fullscreen Action Trigger */}
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20">
                <button
                  type="button"
                  onClick={(e) => handleOpenLightbox(activeImageIndex, e)}
                  className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[var(--bg-primary)]/90 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-[#0B0B0A] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-[6px] text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-lg flex items-center gap-2 backdrop-blur-md active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>View All Photos ({imageUrls.length})</span>
                </button>
              </div>

              {/* Bottom Center Dots Indicator */}
              {imageUrls.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                  {imageUrls.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleSelectImage(idx, e)}
                      aria-label={`Jump to slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full ${idx === activeImageIndex
                          ? "w-6 sm:w-8 h-1.5 bg-[#C89B4A]"
                          : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white"
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Thumbnail Filmstrip (Web & Mobile) */}
            {imageUrls.length > 1 && (
              <div
                ref={thumbnailRowRef}
                className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-touch-pan"
              >
                {imageUrls.map((imgUrl, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleSelectImage(idx, e)}
                      aria-label={`Select photo ${idx + 1}`}
                      className={`relative flex-shrink-0 w-20 h-14 sm:w-28 sm:h-18 md:w-32 md:h-20 rounded-[8px] overflow-hidden transition-all duration-300 bg-[#151412] ${isActive
                          ? "ring-2 ring-[#C89B4A] ring-offset-2 ring-offset-[var(--bg-primary)] opacity-100 scale-[1.03] shadow-md"
                          : "opacity-60 hover:opacity-100 border border-[var(--border-color)]"
                        }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${villa.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-[#C89B4A]/10 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Container>

        {/* 4. Main Content Grid & Integrated Booking Provider */}
        <VillaBookingProvider villa={villa}>
          <Container className="pt-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column (8 Cols): Villa Sections + Calendar Focal Point */}
              <div className="lg:col-span-8 space-y-16">
                {/* 5. Villa Overview Section */}
                <div className="space-y-6 pb-12 border-b border-[var(--border-color)]">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em]">
                      RESIDENCE OVERVIEW
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
                      Private Sanctuary at {villa.name}
                    </h2>
                  </div>

                  <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-light whitespace-pre-line">
                    {villa.description ||
                      "Welcome to an exclusive private luxury sanctuary designed for guests seeking peace, panoramic natural views, and uncompromised hospitality."}
                  </p>

                  {/* Quick Property Stats Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] text-center">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-[var(--accent-muted)] tracking-[0.2em]">Max Guests</span>
                      <p className="font-serif text-lg sm:text-xl font-light text-[var(--text-primary)]">{villa.maxGuests} Guests</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-[var(--accent-muted)] tracking-[0.2em]">Bedrooms</span>
                      <p className="font-serif text-lg sm:text-xl font-light text-[var(--text-primary)]">{villa.bedrooms} Bedrooms</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-[var(--accent-muted)] tracking-[0.2em]">Bathrooms</span>
                      <p className="font-serif text-lg sm:text-xl font-light text-[var(--text-primary)]">{villa.bathrooms} Bathrooms</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-[var(--accent-muted)] tracking-[0.2em]">Hospitality</span>
                      <p className="font-serif text-lg sm:text-xl font-light text-[var(--text-primary)]">24/7 Concierge</p>
                    </div>
                  </div>
                </div>

                {/* 5.5 Interactive Availability Calendar Focal Point */}
                <div id="select-dates" className="space-y-6 pb-12 border-b border-[var(--border-color)] scroll-mt-24 sm:scroll-mt-28">
                  <VillaCalendar />
                  {/* Mobile Layout: Responsive Booking Card directly beneath calendar */}
                  <div id="mobile-booking-card" className="lg:hidden scroll-mt-24">
                    <VillaBookingCard />
                  </div>
                </div>

                {/* 6. Residence Amenities */}
                {villa.amenities && villa.amenities.length > 0 && (
                  <div className="space-y-6 pb-12 border-b border-[var(--border-color)]">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em]">
                        AMENITIES &amp; COMFORT
                      </span>
                      <h2 className="font-serif text-3xl font-light text-[var(--text-primary)]">
                        What this villa offers
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {villa.amenities.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3.5 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[6px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                          <span className="text-xs font-medium text-[var(--text-primary)] uppercase tracking-wider">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Sleeping / Bedroom Information */}
                <div className="space-y-6 pb-12 border-b border-[var(--border-color)]">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em]">
                      ACCOMMODATION
                    </span>
                    <h2 className="font-serif text-3xl font-light text-[var(--text-primary)]">
                      Sleeping Arrangements
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.from({ length: villa.bedrooms || 1 }, (_, i) => i + 1).map((num) => (
                      <div key={num} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] space-y-2">
                        <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <h3 className="font-serif text-lg font-medium text-[var(--text-primary)]">
                          Bedroom Suite {num}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] font-light">
                          Private luxury suite with ensuite bathroom &amp; scenic views.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. House Rules */}
                {villa.houseRules && villa.houseRules.length > 0 && (
                  <div className="space-y-6 pb-12 border-b border-[var(--border-color)]">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em]">
                        RESIDENCE POLICIES
                      </span>
                      <h2 className="font-serif text-3xl font-light text-[var(--text-primary)]">
                        House Rules
                      </h2>
                    </div>

                    <ul className="space-y-3.5 text-[var(--text-secondary)] text-xs uppercase tracking-wider font-medium">
                      {villa.houseRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[6px]">
                          <span className="w-1.5 h-1.5 bg-[var(--accent)] mt-1.5 flex-shrink-0 rounded-full" />
                          <span className="text-[var(--text-primary)]">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 9. Cancellation Policy */}
                {villa.cancellationPolicy && (
                  <div className="space-y-4 p-6 sm:p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px]">
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em] block">
                      TERMS &amp; CANCELLATION
                    </span>
                    <h3 className="font-serif text-2xl font-light text-[var(--text-primary)]">
                      Cancellation Policy
                    </h3>
                    <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed font-light">
                      {villa.cancellationPolicy}
                    </p>
                  </div>
                )}

                {/* 10. Location Section */}
                <div className="space-y-4 p-6 sm:p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px]">
                  <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em] block">
                    LOCATION &amp; SURROUNDINGS
                  </span>
                  <h3 className="font-serif text-2xl font-light text-[var(--text-primary)]">
                    {villa.location || "Daranga Estate Sanctuary"}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed font-light">
                    Situated in a private, tranquil estate designed for quiet luxury, panoramic natural views, and secluded relaxation away from urban noise.
                  </p>
                </div>
              </div>

              {/* Right Column (4 Cols): Desktop Sticky Reservation Summary Card */}
              <div className="hidden lg:block lg:col-span-4">
                <div className="sticky top-28">
                  <VillaBookingCard />
                </div>
              </div>
            </div>
          </Container>

          {/* 11. Related Villas Section */}
          {relatedVillas.length > 0 && (
            <div className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-16 sm:py-20 mt-16 sm:mt-20">
              <Container>
                <div className="space-y-10">
                  <div className="text-center space-y-3">
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.3em]">
                      YOU MAY ALSO LIKE
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
                      Explore Other Sanctuaries
                    </h2>
                  </div>

                  <VillaCardsCarousel
                    villas={relatedVillas.slice(0, 3)}
                  />
                </div>
              </Container>
            </div>
          )}

          {/* 12. Dynamic Sticky Bottom Mobile Booking Bar (< lg screens) */}
          <MobileStickyBookingBar />
        </VillaBookingProvider>
      </main>

      {/* 13. Footer */}
      <Footer />

      {/* Full-Screen Lightbox Modal */}
      <Lightbox
        isOpen={isLightboxOpen}
        images={imageUrls}
        currentIndex={selectedImageIndex}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(newIdx) => setSelectedImageIndex(newIdx)}
      />
    </div>
  );
}
