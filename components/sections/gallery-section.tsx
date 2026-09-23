"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Lightbox } from "@/components/ui/lightbox";
import { Villa } from "@/types/villa";

interface GallerySectionProps {
  villas?: Villa[];
}

export function GallerySection({ villas = [] }: GallerySectionProps) {
  // Extract all valid image URLs from villas
  const villaImages: string[] = [];
  villas.forEach((v) => {
    if (Array.isArray(v.images)) {
      v.images.forEach((img) => {
        if (typeof img === "string" && img.startsWith("http")) {
          villaImages.push(img);
        } else if (img && typeof img === "object" && "url" in img) {
          const u = (img as { url: string }).url;
          if (u && u.startsWith("http")) villaImages.push(u);
        }
      });
    }
  });

  const defaultGalleryImages = [
    "/images/hero/heroimg.webp",
    "/images/hero/heroimg.webp",
    "/images/hero/heroimg.webp",
  ];

  const galleryImages =
    villaImages.length > 0 ? Array.from(new Set(villaImages)) : defaultGalleryImages;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mobile Swipe Carousel state
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  const handleMobileScroll = useCallback(() => {
    const el = mobileGalleryRef.current;
    if (!el || galleryImages.length <= 1) return;
    const slideWidth = el.offsetWidth;
    if (slideWidth <= 0) return;
    const newIdx = Math.min(
      Math.max(Math.round(el.scrollLeft / slideWidth), 0),
      galleryImages.length - 1
    );
    setActiveMobileIndex(newIdx);
  }, [galleryImages.length]);

  const scrollToGalleryIndex = (idx: number) => {
    const el = mobileGalleryRef.current;
    if (!el) return;
    const slideWidth = el.offsetWidth;
    el.scrollTo({
      left: idx * slideWidth,
      behavior: "smooth",
    });
    setActiveMobileIndex(idx);
  };

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

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0 && activeMobileIndex < galleryImages.length - 1) {
        scrollToGalleryIndex(activeMobileIndex + 1);
      } else if (diffX < 0 && activeMobileIndex > 0) {
        scrollToGalleryIndex(activeMobileIndex - 1);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleOpenLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section id="gallery" className="py-24 lg:py-36 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] block">
            VISUAL PORTFOLIO
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
            A Glimpse into Paradise.
          </h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-light leading-relaxed">
            Take a visual tour of our private residences, serene infinity pools, lush gardens, and luxury living spaces.
          </p>
        </div>

        {/* Mobile Swipeable Gallery (< sm) */}
        <div className="block sm:hidden">
          <div className="relative w-full rounded-[8px] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl">
            <div
              ref={mobileGalleryRef}
              onScroll={handleMobileScroll}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-touch-pan w-full aspect-[16/10]"
            >
              {galleryImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenLightbox(idx)}
                  className="w-full h-full flex-shrink-0 snap-center relative cursor-pointer bg-[#151412]"
                >
                  <Image
                    src={imgUrl}
                    alt={`Estate Gallery Photo ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Mobile Photo Counter Badge */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-3 right-3 pointer-events-none z-10">
                <span className="px-2.5 py-1 bg-[var(--bg-primary)]/90 backdrop-blur-xs border border-[var(--border-color)] rounded-[4px] text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider shadow-md">
                  {activeMobileIndex + 1} / {galleryImages.length}
                </span>
              </div>
            )}

            {/* Mobile Pagination Dots */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
                {galleryImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`transition-all duration-300 rounded-full ${idx === activeMobileIndex
                        ? "w-4 h-1.5 bg-[var(--accent)]"
                        : "w-1.5 h-1.5 bg-[var(--bg-primary)]/80 border border-[var(--border-color)]"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop / Tablet Asymmetric Editorial Gallery Grid (sm+) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((imgUrl, idx) => {
            const isFeatured = idx === 0;
            return (
              <div
                key={idx}
                onClick={() => handleOpenLightbox(idx)}
                className={`group relative w-full overflow-hidden bg-[var(--bg-secondary)] cursor-pointer rounded-[6px] border border-[var(--border-color)] shadow-xl ${isFeatured
                    ? "sm:col-span-2 aspect-[16/9]"
                    : "aspect-[4/3]"
                  }`}
              >
                <Image
                  src={imgUrl}
                  alt={`Estate Gallery Photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[var(--bg-primary)]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] shadow-lg">
                    EXPAND PHOTO
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxOpen}
        images={galleryImages}
        currentIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIndex) => setCurrentIndex(newIndex)}
      />
    </section>
  );
}

