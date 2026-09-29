"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Users,
  Bed,
  Bath,
  MapPin,
  CheckCircle2,
  Shield,
  Tag,
  ExternalLink,
  Navigation,
  Star,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import {
  VillaBookingProvider,
  VillaCalendar,
  VillaBookingCard,
  MobileStickyBookingBar,
} from "@/components/villas/villa-booking-widget";
import { VillaGalleryModal } from "@/components/villas/villa-gallery-modal";
import { VillaAmenitiesModal } from "@/components/villas/villa-amenities-modal";
import { renderAmenityIcon, getAmenityPricing } from "@/components/ui/amenity-icon";
import { VillaCardsCarousel } from "@/components/ui/villa-cards-carousel";
import { VillaLocationMap } from "@/components/villas/villa-location-map";
import { buildGoogleMapsSearchUrl, buildGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { Villa } from "@/types/villa";
import { getVillaAddress } from "@/lib/utils/villa-location";
import { getVillaImagesWithMetadata, formatCategoryLabel } from "@/lib/utils/image";

interface VillaDetailClientProps {
  villa: Villa;
  relatedVillas?: Villa[];
}

export function VillaDetailClient({ villa, relatedVillas = [] }: VillaDetailClientProps) {
  // Extract normalized VillaImageObject array with full metadata
  const galleryImages = getVillaImagesWithMetadata(villa.images, villa.imageUrl);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);



  const thumbnailRowRef = useRef<HTMLDivElement>(null);
  const [isStageHovered, setIsStageHovered] = useState(false);
  const [isStageTouched, setIsStageTouched] = useState(false);
  const touchResumeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Smooth Auto-Slide Effect (4.5s duration, pauses on hover, touch, or when fullscreen modal is open)
  useEffect(() => {
    if (galleryImages.length <= 1 || isStageHovered || isStageTouched || isGalleryOpen) return;

    const timer = setTimeout(() => {
      setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
    }, 4500);

    return () => clearTimeout(timer);
  }, [activeImageIndex, galleryImages.length, isStageHovered, isStageTouched, isGalleryOpen]);

  useEffect(() => {
    return () => {
      if (touchResumeTimeout.current) clearTimeout(touchResumeTimeout.current);
    };
  }, []);

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const handleSelectImage = (idx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex(idx);
  };

  const handleOpenGallery = (idx?: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof idx === "number") {
      setActiveImageIndex(idx);
    }
    setIsGalleryOpen(true);
  };

  // Touch swiping gesture handlers for main image
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchResumeTimeout.current) clearTimeout(touchResumeTimeout.current);
    setIsStageTouched(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const diffX = touchStartX.current - e.changedTouches[0].clientX;
      const diffY = touchStartY.current - e.changedTouches[0].clientY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX > 0) {
          handleNextImage();
        } else {
          handlePrevImage();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchResumeTimeout.current = setTimeout(() => {
      setIsStageTouched(false);
    }, 2500);
  };

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];
  const displayedAmenities = villa.amenities ? villa.amenities.slice(0, 8) : [];
  const hasMoreAmenities = villa.amenities && villa.amenities.length > 8;

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF9] dark:bg-[#171717] font-sans text-[#202020] dark:text-[#FCFBF9] selection:bg-[#EFA1AA] selection:text-[#202020]">
      <Navbar transparentOnTop={false} />

      <main className="flex-1 pt-20 sm:pt-24 lg:pt-28 pb-20 sm:pb-24 lg:pb-16">
        {/* Villa Title & Meta Header Section (StayVista Reference Style) */}
        <div className="pt-2 sm:pt-4 pb-2 sm:pb-3">
          <Container>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#202020] dark:text-[#FCFBF9] tracking-tight leading-tight break-words font-serif">
                  {villa.name}
                </h1>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#555555] dark:text-[#BDBDBD]">
                  <MapPin className="w-3.5 h-3.5 text-[#202020] dark:text-white" />
                  <span>{getVillaAddress(villa.location, "Udaipur, Rajasthan")}</span>
                </div>
                {/* Ratings line with laurels & reviews link matching reference */}
                <div className="flex items-center gap-2 pt-0.5 text-xs sm:text-sm text-[#555555] dark:text-[#BDBDBD] flex-wrap">
                  <span className="font-semibold text-[#202020] dark:text-[#FCFBF9]">
                    🌿 Luxury Sanctuary 🌿
                  </span>
                  <span className="text-[#999999]">•</span>
                  <span className="flex items-center gap-1 font-bold text-[#202020] dark:text-[#FCFBF9]">
                    <Star className="w-3.5 h-3.5 fill-[#EFA1AA] text-[#EFA1AA]" />
                    <span>{villa.rating || "4.9"}/5</span>
                  </span>
                  <span className="text-[#999999]">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("select-dates");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    {villa.reviewsCount || 48} Reviews
                  </button>
                </div>
              </div>

              {/* View Brochure Action Button */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-1 md:pt-0">
                <button
                  type="button"
                  onClick={() => setIsAmenitiesModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-[#DCDCDC] dark:border-[#383838] bg-white dark:bg-[#202020] hover:bg-[#F7F7F6] text-xs font-semibold text-[#202020] dark:text-[#FCFBF9] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#EFA1AA]" />
                  <span>View Brochure</span>
                </button>
              </div>
            </div>
          </Container>
        </div>

        {/* 3. Cinema Interactive Image Slider & Thumbnail Filmstrip (Web & Mobile) */}
        <Container className="pt-2 sm:pt-4">
          <div className="space-y-3.5">
            {/* Main Stage Cinema Showcase */}
            <div
              className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px] xl:h-[620px] rounded-2xl overflow-hidden border border-[#E8E8E8] dark:border-[#383838] bg-[#171717] shadow-md group/stage select-none cursor-pointer"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsStageHovered(true)}
              onMouseLeave={() => setIsStageHovered(false)}
              onClick={() => handleOpenGallery(activeImageIndex)}
            >
              {/* Stacked Images for Smooth Crossfade */}
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === activeImageIndex ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                    }`}
                >
                  <Image
                    src={img.url}
                    alt={img.label || `${villa.name} photograph ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 85vw"
                    className={`object-cover transition-transform duration-[6000ms] ease-out ${idx === activeImageIndex ? "scale-105" : "scale-100"
                      }`}
                  />
                </div>
              ))}

              {/* Ambient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover/stage:opacity-40 transition-opacity duration-500 z-10" />

              {/* Top Left Tag Badge (Desktop only) */}
              <div className="hidden sm:block absolute top-4 sm:top-6 left-4 sm:left-6 z-20 pointer-events-none">
                <span className="px-3.5 py-1.5 bg-white/95 dark:bg-[#202020]/95 text-[#202020] dark:text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold border border-white/20 backdrop-blur-md rounded-full shadow-sm">
                  Exclusive Sanctuary • {getVillaAddress(villa.location, "Daranga Estate")}
                </span>
              </div>

              {/* Top Right Counter Badge (Desktop only) */}
              <div className="hidden sm:block absolute top-4 sm:top-6 right-4 sm:right-6 z-20 pointer-events-none">
                <span className="px-3 py-1 sm:py-1.5 bg-black/60 backdrop-blur-md text-stone-200 text-xs sm:text-sm font-mono tracking-wider font-medium rounded-full border border-white/15 shadow-md flex items-center gap-1.5">
                  <span>
                    {activeImageIndex + 1} / {galleryImages.length}
                  </span>
                </span>
              </div>

              {/* Bottom Left: Category & Subtle Image Label (Desktop only) */}
              <div className="hidden sm:block absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-20 pointer-events-none max-w-sm sm:max-w-md">
                <div className="flex items-center gap-2 flex-wrap">
                  {activeImage?.category && (
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-[#EFA1AA] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold rounded-full border border-[#EFA1AA]/30 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{formatCategoryLabel(activeImage.category)}</span>
                    </span>
                  )}
                  {activeImage?.label && (
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-medium tracking-wide rounded-full border border-white/15 drop-shadow-md">
                      {activeImage.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Previous Arrow Button (Desktop only on hover) */}
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous photo"
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#202020]/75 hover:bg-[#202020] text-white border border-white/20 items-center justify-center transition-all duration-200 shadow-xl opacity-0 group-hover/stage:opacity-100 hover:scale-105 active:scale-95 focus:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Next Arrow Button (Desktop only on hover) */}
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next photo"
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#202020]/75 hover:bg-[#202020] text-white border border-white/20 items-center justify-center transition-all duration-200 shadow-xl opacity-0 group-hover/stage:opacity-100 hover:scale-105 active:scale-95 focus:opacity-100"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Bottom Right Fullscreen Action Trigger (Compact on Mobile) */}
              <div className="absolute bottom-2.5 right-2.5 sm:bottom-6 sm:right-6 z-20">
                <button
                  type="button"
                  onClick={(e) => handleOpenGallery(activeImageIndex, e)}
                  aria-label={`View all ${galleryImages.length} photos`}
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-[#202020]/90 hover:bg-[#202020] text-white border border-white/20 rounded-xl text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em] transition-all shadow-md flex items-center gap-1.5 sm:gap-2 backdrop-blur-md active:scale-95"
                >
                  <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">View All Photos ({galleryImages.length})</span>
                  <span className="sm:hidden font-medium">{galleryImages.length} Photos</span>
                </button>
              </div>

              {/* Bottom Center Dots Indicator */}
              {galleryImages.length > 1 && (
                <div className="hidden sm:flex absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleSelectImage(idx, e)}
                      aria-label={`Jump to slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full ${idx === activeImageIndex
                          ? "w-6 sm:w-8 h-1.5 bg-white"
                          : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white"
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Thumbnail Filmstrip (Web & Mobile) */}
            {galleryImages.length > 1 && (
              <div
                ref={thumbnailRowRef}
                className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-touch-pan"
              >
                {galleryImages.map((img, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleSelectImage(idx, e)}
                      aria-label={`Select photo ${idx + 1}`}
                      className={`relative flex-shrink-0 w-20 h-14 sm:w-28 sm:h-18 md:w-32 md:h-20 rounded-xl overflow-hidden transition-all duration-300 bg-[#F7F7F6] dark:bg-[#202020] ${isActive
                          ? "ring-2 ring-[#202020] dark:ring-white ring-offset-2 ring-offset-[#FCFBF9] dark:ring-offset-[#171717] opacity-100 scale-[1.03] shadow-md"
                          : "opacity-60 hover:opacity-100 border border-[#E8E8E8] dark:border-[#383838]"
                        }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.label || `${villa.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-[#202020]/10 pointer-events-none" />
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
          <Container className="pt-6 sm:pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column (8 Cols): Villa Sections + Calendar Focal Point */}
              <div className="lg:col-span-8 space-y-8 sm:space-y-10">
                {/* 5. Villa Overview & Description Section */}
                <div className="space-y-4 pb-8 sm:pb-10 border-b border-[#E8E8E8] dark:border-[#383838]">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-[#EFA1AA] tracking-[0.25em]">
                      RESIDENCE OVERVIEW
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF9]">
                      Private Sanctuary at {villa.name}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <p
                      className={`text-[#66635F] dark:text-[#BDB8B0] text-sm sm:text-base leading-relaxed font-light whitespace-pre-line transition-all duration-300 ${!isDescriptionExpanded &&
                          ((villa.description && villa.description.length > 200) ||
                            (villa.description && villa.description.split("\n").length > 3))
                          ? "line-clamp-3 sm:line-clamp-4"
                          : ""
                        }`}
                    >
                      {villa.description ||
                        "Welcome to an exclusive private luxury sanctuary designed for guests seeking peace, panoramic natural views, and uncompromised hospitality."}
                    </p>

                    {Boolean(
                      villa.description &&
                      (villa.description.length > 200 ||
                        villa.description.split("\n").length > 3)
                    ) && (
                        <button
                          type="button"
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#202020] dark:text-[#FCFBF9] hover:text-[#EFA1AA] uppercase tracking-wider transition-colors group cursor-pointer"
                        >
                          <span>{isDescriptionExpanded ? "Show Less" : "Read More"}</span>
                          {isDescriptionExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                          )}
                        </button>
                      )}
                  </div>
                </div>

                {/* 5.5 DIRECTLY AFTER DESCRIPTION: Interactive Availability Calendar & Number of Guests Section */}
                <div
                  id="select-dates"
                  className="space-y-5 pb-8 sm:pb-10 border-b border-[#E8E8E8] dark:border-[#383838] scroll-mt-24 sm:scroll-mt-28"
                >
                  <VillaCalendar />
                  {/* Mobile Layout: Responsive Booking Card directly beneath calendar */}
                  <div id="mobile-booking-card" className="lg:hidden scroll-mt-24">
                    <VillaBookingCard />
                  </div>
                </div>

                {/* Residence Key Highlights Strip (Pastel Blue Information Pills) */}
                <div className="pb-8 sm:pb-10 border-b border-[#E8E8E8] dark:border-[#383838]">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Max Guests */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#DDEEFF] dark:bg-[#1E293B]/70 border border-[#DDEEFF] dark:border-[#334155] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center text-[#202020] dark:text-white flex-shrink-0 shadow-2xs">
                        <Users className="w-5 h-5 text-[#202020] dark:text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#555555] dark:text-[#94A3B8] tracking-wider block">
                          CAPACITY
                        </span>
                        <span className="font-sans text-xs sm:text-sm font-bold text-[#202020] dark:text-white truncate block">
                          Up to {villa.maxGuests} Guests
                        </span>
                      </div>
                    </div>

                    {/* Bedrooms */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#DDEEFF] dark:bg-[#1E293B]/70 border border-[#DDEEFF] dark:border-[#334155] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center text-[#202020] dark:text-white flex-shrink-0 shadow-2xs">
                        <Bed className="w-5 h-5 text-[#202020] dark:text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#555555] dark:text-[#94A3B8] tracking-wider block">
                          BEDROOMS
                        </span>
                        <span className="font-sans text-xs sm:text-sm font-bold text-[#202020] dark:text-white truncate block">
                          {villa.bedrooms || 1} Bedrooms
                        </span>
                      </div>
                    </div>

                    {/* Bathrooms */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#DDEEFF] dark:bg-[#1E293B]/70 border border-[#DDEEFF] dark:border-[#334155] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center text-[#202020] dark:text-white flex-shrink-0 shadow-2xs">
                        <Bath className="w-5 h-5 text-[#202020] dark:text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#555555] dark:text-[#94A3B8] tracking-wider block">
                          BATHROOMS
                        </span>
                        <span className="font-sans text-xs sm:text-sm font-bold text-[#202020] dark:text-white truncate block">
                          {villa.bathrooms || 1} Bathrooms
                        </span>
                      </div>
                    </div>

                    {/* Hospitality */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#DDEEFF] dark:bg-[#1E293B]/70 border border-[#DDEEFF] dark:border-[#334155] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center text-[#202020] dark:text-white flex-shrink-0 shadow-2xs">
                        <Sparkles className="w-5 h-5 text-[#202020] dark:text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#555555] dark:text-[#94A3B8] tracking-wider block">
                          HOSPITALITY
                        </span>
                        <span className="font-sans text-xs sm:text-sm font-bold text-[#202020] dark:text-white truncate block">
                          24/7 Concierge
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Residence Amenities (Matching Reference Screenshot) */}
                <div className="space-y-5 pb-8 sm:pb-10 border-b border-[#E8E8E8] dark:border-[#383838]">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold text-[#EFA1AA] tracking-[0.25em]">
                        ESTATE AMENITIES &amp; SERVICES
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF9]">
                      Villa Amenities
                    </h2>
                  </div>

                  {displayedAmenities.length === 0 ? (
                    <p className="text-xs text-[#555555] dark:text-[#BDBDBD] italic">
                      Amenities will be updated soon for this private residence.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-5 sm:gap-y-6 pt-1">
                      {displayedAmenities.map((item, idx) => {
                        const pricing = getAmenityPricing(item);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 sm:gap-3.5 group"
                          >
                            {/* Square Icon Box with rounded corners and border */}
                            <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-xl border border-[#E8E8E8] dark:border-[#383838] bg-white dark:bg-[#1E1E1E] flex items-center justify-center p-2 flex-shrink-0 shadow-2xs group-hover:border-[#202020] dark:group-hover:border-white transition-colors">
                              {pricing.isPaid && (
                                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-white dark:bg-[#202020] border border-[#3F7658] text-[#3F7658] text-[10px] font-bold flex items-center justify-center shadow-xs">
                                  ₹
                                </span>
                              )}
                              <div className="text-[#202020] dark:text-[#FCFBF9]">
                                {renderAmenityIcon(item, "w-7 h-7 sm:w-8 sm:h-8")}
                              </div>
                            </div>

                            {/* Name and Optional Green Price Tag */}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs sm:text-sm font-normal text-[#202020] dark:text-[#FCFBF9] leading-snug line-clamp-2">
                                {item}
                              </span>
                              {pricing.isPaid && pricing.price && (
                                <span className="text-xs font-semibold text-[#3F7658] mt-0.5">
                                  {pricing.price}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* +X more blue text link matching screenshot */}
                      {hasMoreAmenities && (
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => setIsAmenitiesModalOpen(true)}
                            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs sm:text-sm underline underline-offset-4 transition-colors cursor-pointer text-left"
                          >
                            +{(villa.amenities?.length || 0) - displayedAmenities.length} more
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 8. House Rules (Compact Amenities Grid Design Style) */}
                {(() => {
                  const baseRules = [
                    {
                      id: "checkin",
                      icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7" />,
                      title: "Check-In",
                      subtitle: "02:00 PM onwards",
                      isPrimary: true,
                    },
                    {
                      id: "checkout",
                      icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7" />,
                      title: "Check-Out",
                      subtitle: "11:00 AM sharp",
                      isPrimary: true,
                    },
                    {
                      id: "nosmoking",
                      icon: (
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="2" y1="2" x2="22" y2="22" />
                          <path d="M18 8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3" />
                          <path d="M22 12v3a3 3 0 0 1-3 3" />
                          <line x1="7" y1="12" x2="7.01" y2="12" />
                        </svg>
                      ),
                      title: "No Indoor Smoking",
                      subtitle: "Permitted in outdoor verandas",
                      isPrimary: false,
                    },
                    {
                      id: "quiethours",
                      icon: (
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                          <path d="M19 3v4" />
                          <path d="M21 5h-4" />
                        </svg>
                      ),
                      title: "Quiet Hours Observed",
                      subtitle: "Post 10:00 PM loud music restricted",
                      isPrimary: false,
                    },
                    {
                      id: "govt-id",
                      icon: (
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="18" height="14" x="3" y="5" rx="2" />
                          <circle cx="9" cy="11" r="2" />
                          <path d="M15 9h2" />
                          <path d="M15 13h2" />
                          <path d="M6 16a3 3 0 0 1 6 0" />
                        </svg>
                      ),
                      title: "Govt ID Mandatory",
                      subtitle: "Required for all adult guests",
                      isPrimary: false,
                    },
                    {
                      id: "pet-guest",
                      icon: (
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      ),
                      title: "Prior Concierge Notice",
                      subtitle: "For pets & day visitors",
                      isPrimary: false,
                    },
                  ];

                  if (villa.houseRules && Array.isArray(villa.houseRules)) {
                    villa.houseRules.forEach((rule, idx) => {
                      baseRules.push({
                        id: `custom-rule-${idx}`,
                        icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#3F7658]" />,
                        title: rule,
                        subtitle: "Estate Policy",
                        isPrimary: false,
                      });
                    });
                  }

                  const displayedRules = isRulesExpanded ? baseRules : baseRules.slice(0, 3);
                  const remainingRulesCount = baseRules.length - 3;

                  return (
                    <div className="space-y-5 pb-8 sm:pb-10 border-b border-[#E8E8E8] dark:border-[#383838]">
                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-semibold text-[#EFA1AA] tracking-[0.25em]">
                            ESTATE PROTOCOLS &amp; GUIDELINES
                          </span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF9]">
                          House Rules
                        </h2>
                      </div>

                      {/* 2-Column Grid matching Amenities section design */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-5 pt-1">
                        {displayedRules.map((rule) => (
                          <div key={rule.id} className="flex items-center gap-3 sm:gap-3.5 group">
                            <div
                              className={`relative w-13 h-13 sm:w-15 sm:h-15 rounded-xl border border-[#E8E8E8] dark:border-[#383838] bg-white dark:bg-[#1E1E1E] flex items-center justify-center p-2 flex-shrink-0 shadow-2xs group-hover:border-[#202020] dark:group-hover:border-white transition-colors ${
                                rule.isPrimary ? "text-[#202020] dark:text-white" : "text-[#555555] dark:text-[#BDBDBD]"
                              }`}
                            >
                              {rule.icon}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span
                                className={`text-xs sm:text-sm leading-snug ${
                                  rule.isPrimary
                                    ? "text-[10px] uppercase font-bold text-[#202020] dark:text-white tracking-wider"
                                    : "font-normal text-[#202020] dark:text-[#FCFBF9]"
                                }`}
                              >
                                {rule.title}
                              </span>
                              <span
                                className={`${
                                  rule.isPrimary
                                    ? "text-xs sm:text-sm font-semibold text-[#202020] dark:text-[#FCFBF9]"
                                    : "text-[11px] text-[#555555] dark:text-[#BDBDBD] font-normal"
                                }`}
                              >
                                {rule.subtitle}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* +X more blue text link matching Amenities screenshot */}
                        {remainingRulesCount > 0 && (
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                              className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs sm:text-sm underline underline-offset-4 transition-colors cursor-pointer text-left"
                            >
                              {isRulesExpanded ? "Show less rules" : `+${remainingRulesCount} more`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 9. Cancellation Policy */}
                {villa.cancellationPolicy && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#E8E8E8] dark:border-[#383838] shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-semibold text-[#555555] dark:text-[#BDBDBD] tracking-[0.25em]">
                      <Shield className="w-4 h-4 text-[#3F7658]" />
                      <span>TERMS &amp; CANCELLATION</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#202020] dark:text-[#FCFBF9]">
                      Cancellation Policy
                    </h3>
                    <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm leading-relaxed font-normal">
                      {villa.cancellationPolicy}
                    </p>
                  </div>
                )}

                {/* 10. Dedicated Location & Map Section */}
                <div className="space-y-6 pb-8 sm:pb-10 border-b border-[#E8E8E8] dark:border-[#383838]" id="villa-location">
                  {(() => {
                    const addressText = getVillaAddress(villa.location, villa.zone || "Location not specified");

                    const exactLat =
                      typeof villa.location === "object" &&
                      villa.location !== null &&
                      typeof villa.location.latitude === "number" &&
                      !isNaN(villa.location.latitude)
                        ? villa.location.latitude
                        : typeof villa.latitude === "number" && !isNaN(villa.latitude)
                        ? villa.latitude
                        : undefined;

                    const exactLng =
                      typeof villa.location === "object" &&
                      villa.location !== null &&
                      typeof villa.location.longitude === "number" &&
                      !isNaN(villa.location.longitude)
                        ? villa.location.longitude
                        : typeof villa.longitude === "number" && !isNaN(villa.longitude)
                        ? villa.longitude
                        : undefined;

                    const hasValidCoordinates =
                      exactLat !== undefined &&
                      exactLng !== undefined &&
                      exactLat >= -90 &&
                      exactLat <= 90 &&
                      exactLng >= -180 &&
                      exactLng <= 180 &&
                      !(exactLat === 0 && exactLng === 0);

                    const viewMapsUrl = hasValidCoordinates
                      ? buildGoogleMapsSearchUrl(exactLat, exactLng)
                      : "";

                    const directionsUrl = hasValidCoordinates
                      ? buildGoogleMapsDirectionsUrl(exactLat, exactLng)
                      : "";

                    return (
                      <div className="space-y-6">
                        {/* Header & Address */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-semibold text-[#EFA1AA] tracking-[0.25em]">
                            PROPERTY LOCATION
                          </span>
                          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF9]">
                            Location
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#555555] dark:text-[#BDBDBD]">
                            <MapPin className="w-4 h-4 text-[#202020] dark:text-white flex-shrink-0" />
                            <span className="font-medium">{addressText}</span>
                          </div>
                        </div>

                        {/* Exact Google Map Component */}
                        {hasValidCoordinates ? (
                          <div className="space-y-4">
                            <VillaLocationMap
                              latitude={exactLat}
                              longitude={exactLng}
                              address={addressText}
                              villaName={villa.name}
                            />

                            {/* Action Buttons: View on Google Maps & Get Directions */}
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              <a
                                href={viewMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF8] dark:text-[#202020] dark:hover:bg-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                              >
                                <span>View on Google Maps</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl border border-[#DCDCDC] dark:border-[#383838] bg-white dark:bg-[#202020] hover:bg-[#F7F7F6] dark:hover:bg-[#282828] text-[#202020] dark:text-[#FCFBF9] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                              >
                                <Navigation className="w-3.5 h-3.5 text-[#EFA1AA]" />
                                <span>Get Directions</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 sm:p-10 text-center rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] space-y-3">
                            <MapPin className="w-8 h-8 mx-auto text-[#202020] dark:text-white" />
                            <h4 className="font-serif text-lg text-[#202020] dark:text-[#FCFBF9]">
                              Location Details
                            </h4>
                            <p className="text-xs text-[#555555] dark:text-[#BDBDBD] max-w-md mx-auto font-normal">
                              {addressText}. Please contact our concierge team for driving directions.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
            <div className="bg-[#FCFBF9] dark:bg-[#202020] border-t border-[#E8E8E8] dark:border-[#383838] py-12 sm:py-16 mt-12 sm:mt-16">
              <Container>
                <div className="space-y-8">
                  <div className="text-center space-y-3">
                    <span className="text-[10px] uppercase font-semibold text-[#EFA1AA] tracking-[0.25em]">
                      YOU MAY ALSO LIKE
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF9]">
                      Explore Other Sanctuaries
                    </h2>
                  </div>

                  <VillaCardsCarousel villas={relatedVillas.slice(0, 3)} />
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

      {/* Full-Screen Category Lightbox Gallery */}
      <VillaGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={galleryImages}
        initialIndex={activeImageIndex}
        villaName={villa.name}
      />

      {/* Full Amenities Modal */}
      {villa.amenities && (
        <VillaAmenitiesModal
          isOpen={isAmenitiesModalOpen}
          onClose={() => setIsAmenitiesModalOpen(false)}
          amenities={villa.amenities}
          villaName={villa.name}
        />
      )}
    </div>
  );
}
