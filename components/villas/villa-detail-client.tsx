"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Sparkles,
  CheckCircle2,
  Shield,
  Tag,
  Compass,
  Car,
  ExternalLink,
  Globe,
  Navigation,
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
import { AmenityIcon } from "@/components/ui/amenity-icon";
import { VillaCardsCarousel } from "@/components/ui/villa-cards-carousel";
import { RealUdaipurMap } from "@/components/maps/real-udaipur-map";
import { UdaipurLocation } from "@/components/sections/location-section";
import { Villa } from "@/types/villa";
import { getVillaAddress } from "@/lib/utils/villa-location";
import { getVillaImagesWithMetadata, formatCategoryLabel, getPrimaryVillaImageUrl } from "@/lib/utils/image";

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

  // Mapped locations for interactive map
  const allLocationVillas = useMemo<Villa[]>(() => [villa, ...relatedVillas], [villa, relatedVillas]);
  const [selectedMapLocationId, setSelectedMapLocationId] = useState<string>(
    villa.id || villa._id || "villa-0"
  );

  const mappedLocations = useMemo<UdaipurLocation[]>(() => {
    return allLocationVillas.map((v: Villa, index: number): UdaipurLocation => {
      const vLat =
        typeof v.location === "object" &&
          v.location !== null &&
          typeof v.location.latitude === "number" &&
          !isNaN(v.location.latitude)
          ? v.location.latitude
          : typeof v.latitude === "number" && !isNaN(v.latitude)
            ? v.latitude
            : 24.5854 + index * 0.012;

      const vLng =
        typeof v.location === "object" &&
          v.location !== null &&
          typeof v.location.longitude === "number" &&
          !isNaN(v.location.longitude)
          ? v.location.longitude
          : typeof v.longitude === "number" && !isNaN(v.longitude)
            ? v.longitude
            : 73.678 + index * 0.012;

      const vAddress =
        typeof v.location === "object" && v.location !== null
          ? v.location.address || v.zone || "Udaipur, Rajasthan"
          : typeof v.location === "string" && v.location
            ? v.location
            : v.zone || "Udaipur, Rajasthan";

      const posX = v.mapX !== undefined && !isNaN(Number(v.mapX)) ? Number(v.mapX) : 50;
      const posY = v.mapY !== undefined && !isNaN(Number(v.mapY)) ? Number(v.mapY) : 50;
      const dynamicId = v.id || v._id || `villa-${index}`;
      const coverImg =
        getPrimaryVillaImageUrl(v.images) || v.imageUrl || "/images/hero/heroimg.webp";

      return {
        id: dynamicId,
        number: String(index + 1).padStart(2, "0"),
        name: v.name,
        tagline: v.tagline || v.description?.slice(0, 60) || "Private Luxury Villa Residence",
        zone: v.zone || vAddress || "Udaipur, Rajasthan",
        address: vAddress,
        coordinates: { lat: vLat, lng: vLng },
        mapPos: { x: posX, y: posY },
        imageUrl: coverImg,
        highlights: v.amenities?.slice(0, 4) || [
          "Private Pool",
          "Aravalli Mountain Views",
          "24/7 Butler",
        ],
        distanceToAirport: "28 - 36 km (45 min)",
        distanceToCityPalace: "4 - 8 km (15 min)",
        distanceToStation: "6 - 12 km (20 min)",
        description:
          v.description ||
          "An exclusive private sanctuary designed for quiet elegance and natural serenity.",
        googleMapsUrl:
          v.googleMapsUrl && v.googleMapsUrl.trim()
            ? v.googleMapsUrl.trim()
            : `https://www.google.com/maps/search/?api=1&query=${vLat},${vLng}`,
        slug: v.slug,
      };
    });
  }, [allLocationVillas]);

  const selectedLocation = useMemo<UdaipurLocation>(() => {
    return (
      mappedLocations.find((l) => l.id === selectedMapLocationId) ||
      mappedLocations[0]
    );
  }, [mappedLocations, selectedMapLocationId]);

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
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-[var(--bg-primary)]">
      <Navbar transparentOnTop={false} />

      <main className="flex-1 pt-16 sm:pt-20 pb-32 sm:pb-36 lg:pb-20">
        {/* Villa Title Section */}
        <div className="pt-6 sm:pt-8 pb-2 sm:pb-3">
          <Container>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] tracking-tight leading-tight break-words">
              {villa.name}
            </h1>
          </Container>
        </div>

        {/* 3. Cinema Interactive Image Slider & Thumbnail Filmstrip (Web & Mobile) */}
        <Container className="pt-2 sm:pt-4">
          <div className="space-y-3.5">
            {/* Main Stage Cinema Showcase */}
            <div
              className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px] xl:h-[620px] rounded-[12px] sm:rounded-[16px] overflow-hidden border border-[var(--border-color)] bg-[#151412] shadow-2xl group/stage select-none cursor-pointer"
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
                <span className="px-3.5 py-1.5 bg-[var(--bg-primary)]/90 text-[var(--accent)] text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold border border-[var(--accent)]/30 backdrop-blur-md rounded-[4px] shadow-md">
                  Exclusive Sanctuary • {getVillaAddress(villa.location, "Daranga Estate")}
                </span>
              </div>

              {/* Top Right Counter Badge (Desktop only) */}
              <div className="hidden sm:block absolute top-4 sm:top-6 right-4 sm:right-6 z-20 pointer-events-none">
                <span className="px-3 py-1 sm:py-1.5 bg-black/60 backdrop-blur-md text-stone-200 text-xs sm:text-sm font-mono tracking-wider font-medium rounded-[6px] border border-white/15 shadow-md flex items-center gap-1.5">
                  <span>
                    {activeImageIndex + 1} / {galleryImages.length}
                  </span>
                </span>
              </div>

              {/* Auto-Slide Micro Progress Bar */}
              {galleryImages.length > 1 && !isGalleryOpen && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] sm:h-[3px] bg-black/50 z-20 overflow-hidden pointer-events-none">
                  <div
                    key={activeImageIndex}
                    className={`h-full bg-gradient-to-r from-[#C89B4A]/60 via-[#C89B4A] to-[#DFB76C] ${isStageHovered || isStageTouched ? "opacity-30" : "animate-progress-5s opacity-90"
                      }`}
                  />
                </div>
              )}

              {/* Bottom Left: Category & Subtle Image Label (Desktop only) */}
              <div className="hidden sm:block absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-20 pointer-events-none max-w-sm sm:max-w-md">
                <div className="flex items-center gap-2 flex-wrap">
                  {activeImage?.category && (
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-[#C89B4A] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold rounded-[4px] border border-[#C89B4A]/30 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{formatCategoryLabel(activeImage.category)}</span>
                    </span>
                  )}
                  {activeImage?.label && (
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-medium tracking-wide rounded-[4px] border border-white/15 drop-shadow-md">
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
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] items-center justify-center transition-all duration-200 shadow-xl opacity-0 group-hover/stage:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100"
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
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] items-center justify-center transition-all duration-200 shadow-xl opacity-0 group-hover/stage:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100"
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
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-[var(--bg-primary)]/90 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-[#0B0B0A] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-[6px] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em] transition-all shadow-md sm:shadow-lg flex items-center gap-1.5 sm:gap-2 backdrop-blur-md active:scale-95"
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
                          ? "w-6 sm:w-8 h-1.5 bg-[#C89B4A]"
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
                      className={`relative flex-shrink-0 w-20 h-14 sm:w-28 sm:h-18 md:w-32 md:h-20 rounded-[8px] overflow-hidden transition-all duration-300 bg-[#151412] ${isActive
                          ? "ring-2 ring-[#C89B4A] ring-offset-2 ring-offset-[var(--bg-primary)] opacity-100 scale-[1.03] shadow-md"
                          : "opacity-60 hover:opacity-100 border border-[var(--border-color)]"
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
                {/* 5. Villa Overview & Description Section */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em]">
                      RESIDENCE OVERVIEW
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
                      Private Sanctuary at {villa.name}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <p
                      className={`text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-light whitespace-pre-line transition-all duration-300 ${!isDescriptionExpanded &&
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
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:text-[#b5893a] uppercase tracking-[0.16em] transition-colors group cursor-pointer"
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
                  className="space-y-6 pb-12 border-b border-[var(--border-color)] scroll-mt-24 sm:scroll-mt-28"
                >
                  <VillaCalendar />
                  {/* Mobile Layout: Responsive Booking Card directly beneath calendar */}
                  <div id="mobile-booking-card" className="lg:hidden scroll-mt-24">
                    <VillaBookingCard />
                  </div>
                </div>

                {/* Quick Property Stats Strip with Lucide Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] text-center">
                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Users className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent-muted)] tracking-[0.2em]">
                      Max Guests
                    </span>
                    <p className="font-serif text-lg sm:text-xl font-light text-[var(--text-primary)]">
                      {villa.maxGuests} Guests
                    </p>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Bed className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent-muted)] tracking-[0.2em]">
                      Bedrooms
                    </span>
                    <p className="font-serif text-lg sm:text-xl font-light text-[var(--text-primary)]">
                      {villa.bedrooms || 1} Bedrooms
                    </p>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Bath className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent-muted)] tracking-[0.2em]">
                      Bathrooms
                    </span>
                    <p className="font-serif text-lg sm:text-xl font-light text-[var(--text-primary)]">
                      {villa.bathrooms || 1} Bathrooms
                    </p>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent-muted)] tracking-[0.2em]">
                      Hospitality
                    </span>
                    <p className="font-serif text-lg sm:text-xl font-light text-[var(--text-primary)]">
                      24/7 Concierge
                    </p>
                  </div>
                </div>

                {/* 6. Residence Amenities with Professional Icons & View All Modal */}
                <div className="space-y-6 pb-12 border-b border-[var(--border-color)]">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em]">
                      AMENITIES &amp; COMFORT
                    </span>
                    <h2 className="font-serif text-3xl font-light text-[var(--text-primary)]">
                      What this villa offers
                    </h2>
                  </div>

                  {displayedAmenities.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] italic">
                      Amenities will be updated soon for this private residence.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        {displayedAmenities.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3.5 p-3.5 sm:p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] hover:border-[var(--accent)]/40 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] shadow-xs">
                              <AmenityIcon name={item} className="w-4 h-4 text-[var(--accent)]" />
                            </div>
                            <span className="text-xs font-semibold text-[var(--text-primary)] tracking-wide">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>

                      {hasMoreAmenities && (
                        <button
                          type="button"
                          onClick={() => setIsAmenitiesModalOpen(true)}
                          className="px-5 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-[6px] text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider transition-colors flex items-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>View All Amenities ({villa.amenities?.length})</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

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
                      <div
                        key={num}
                        className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] space-y-3"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent)]">
                          <Bed className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-medium text-[var(--text-primary)]">
                            Bedroom Suite {num}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] font-light mt-1">
                            Private luxury suite with ensuite bathroom &amp; scenic views.
                          </p>
                        </div>
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

                    <ul className="space-y-3 text-[var(--text-secondary)] text-xs font-medium">
                      {villa.houseRules.map((rule, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[6px]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                          <span className="text-[var(--text-primary)] leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 9. Cancellation Policy */}
                {villa.cancellationPolicy && (
                  <div className="space-y-4 p-6 sm:p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px]">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em]">
                      <Shield className="w-3.5 h-3.5" />
                      <span>TERMS &amp; CANCELLATION</span>
                    </div>
                    <h3 className="font-serif text-2xl font-light text-[var(--text-primary)]">
                      Cancellation Policy
                    </h3>
                    <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed font-light">
                      {villa.cancellationPolicy}
                    </p>
                  </div>
                )}

                {/* 10. Dedicated Interactive Map & Surroundings Section */}
                <div className="space-y-6 pb-12 border-b border-[var(--border-color)]" id="villa-location">
                  {(() => {
                    const addressText =
                      typeof villa.location === "object" && villa.location !== null
                        ? villa.location.address || villa.zone || "Daranga Sanctuary Estate, Udaipur"
                        : typeof villa.location === "string" && villa.location
                          ? villa.location
                          : villa.zone || "Daranga Sanctuary Estate, Udaipur";

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
                      exactLat !== 0 &&
                      exactLng !== 0 &&
                      exactLat >= -90 &&
                      exactLat <= 90 &&
                      exactLng >= -180 &&
                      exactLng <= 180;

                    const googleMapsOpenUrl = hasValidCoordinates
                      ? `https://www.google.com/maps/search/?api=1&query=${exactLat},${exactLng}`
                      : "https://www.google.com/maps";

                    const directionsUrl = hasValidCoordinates
                      ? `https://www.google.com/maps/dir/?api=1&destination=${exactLat},${exactLng}`
                      : "https://www.google.com/maps";

                    return (
                      <>
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-[0.25em] flex items-center gap-2">
                            <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>LOCATION &amp; SURROUNDINGS • UDAIPUR</span>
                          </span>
                          <h2 className="font-serif text-3xl font-light text-[var(--text-primary)]">
                            {addressText}
                          </h2>
                          {hasValidCoordinates && (
                            <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                              Exact Coordinates: {exactLat.toFixed(5)}, {exactLng.toFixed(5)}
                            </p>
                          )}
                        </div>

                        {/* Real Interactive Google Maps Container with Street & Satellite Layers */}
                        {hasValidCoordinates ? (
                          <div className="space-y-4">
                            <div className="w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[540px] rounded-[16px] overflow-hidden border border-[var(--border-color)] bg-[#12110F] shadow-xl relative">
                              <RealUdaipurMap
                                locations={mappedLocations}
                                selectedLocation={selectedLocation}
                                onSelectLocation={(loc) => setSelectedMapLocationId(loc.id)}
                              />
                            </div>

                            {/* Location Action Card: Address & Action CTAs */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-[14px] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <MapPin className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                                <span className="truncate text-xs font-medium text-[var(--text-primary)]">
                                  {addressText}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5 flex-shrink-0">
                                {/* Open in Google Maps Button */}
                                <a
                                  href={googleMapsOpenUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[#b5893a] text-[#0B0B0A] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                  <span>Open in Google Maps</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                {/* Get Directions Button */}
                                <a
                                  href={directionsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--accent)] hover:text-[#0B0B0A] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                >
                                  <Navigation className="w-3.5 h-3.5 text-[var(--accent)]" />
                                  <span>Get Directions</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 sm:p-10 text-center rounded-[16px] bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
                            <MapPin className="w-8 h-8 mx-auto text-[var(--accent)]/60" />
                            <h4 className="font-serif text-lg text-[var(--text-primary)]">
                              Exact map location not available yet.
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                              {addressText}. Please contact our concierge team for driving directions.
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Location Context & Transit Distance Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Atmosphere Card */}
                    <div className="p-5 sm:p-6 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>PRIVATE SANCTUARY LOCATION</span>
                      </div>
                      <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] leading-relaxed">
                        Nestled in the tranquil valleys of Udaipur with panoramic views of the Aravalli range, offering total privacy, serene surroundings, and convenient road connectivity.
                      </p>
                    </div>

                    {/* Transit Proximity Times */}
                    <div className="p-5 sm:p-6 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--accent)] flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" />
                        <span>TRANSIT PROXIMITY</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
                          <span className="text-[var(--text-secondary)]">Maharana Pratap Airport</span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">~ 32 km (45 min)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
                          <span className="text-[var(--text-secondary)]">Udaipur Railway Station</span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">~ 8 km (18 min)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
                          <span className="text-[var(--text-secondary)]">City Palace &amp; Lake Pichola</span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">~ 6 km (15 min)</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
