"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  Maximize2,
  Tag,
} from "lucide-react";
import { VillaImageObject, VillaImageCategory, VILLA_IMAGE_CATEGORIES } from "@/types/villa";
import { formatCategoryLabel } from "@/lib/utils/image";

interface VillaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: VillaImageObject[];
  initialIndex?: number;
  villaName: string;
}

interface VillaGalleryModalContentProps {
  onClose: () => void;
  images: VillaImageObject[];
  initialIndex: number;
  villaName: string;
}

function VillaGalleryModalContent({
  onClose,
  images,
  initialIndex,
  villaName,
}: VillaGalleryModalContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  );
  const [viewMode, setViewMode] = useState<"cinema" | "grid">("cinema");

  // Extract unique categories available in this villa's photos
  const availableCategories = useMemo(() => {
    const cats = new Set<VillaImageCategory>();
    images.forEach((img) => {
      if (img.category) cats.add(img.category);
    });

    const list: { key: string; label: string; count: number }[] = [
      { key: "ALL", label: "All Photos", count: images.length },
    ];

    VILLA_IMAGE_CATEGORIES.forEach((cat) => {
      const count = images.filter((img) => img.category === cat.value).length;
      if (count > 0) {
        list.push({
          key: cat.value,
          label: cat.label,
          count,
        });
      }
    });

    return list;
  }, [images]);

  // Filtered images based on selected category tab
  const filteredImages = useMemo(() => {
    if (selectedCategory === "ALL") {
      return images;
    }
    return images.filter((img) => img.category === selectedCategory);
  }, [images, selectedCategory]);

  // Ensure currentIndex stays within bounds of filtered list
  const safeCurrentIndex = Math.min(
    Math.max(0, currentIndex),
    Math.max(0, filteredImages.length - 1)
  );
  const activeImage = filteredImages[safeCurrentIndex] || images[0];

  const handlePrev = useCallback(() => {
    if (filteredImages.length === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    if (filteredImages.length === 0) return;
    setCurrentIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
  }, [filteredImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handlePrev, handleNext, onClose]);

  // Auto-scroll thumbnail filmstrip to active image
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = thumbnailStripRef.current;
    if (!container) return;
    const activeThumb = container.children[safeCurrentIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [safeCurrentIndex]);

  // Touch gesture support
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
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${villaName} Photo Gallery`}
      className="fixed inset-0 z-50 flex flex-col bg-[#0B0B0A] text-[#F4EFE5] select-none animate-in fade-in duration-250"
    >
      {/* Top Header Bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-[#302D28] bg-[#151412]/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-light text-[#F4EFE5] truncate max-w-xs sm:max-w-md">
              {villaName}
            </h2>
            <div className="text-[10px] sm:text-[11px] text-[#A9A39A] uppercase tracking-wider font-mono">
              Photo {safeCurrentIndex + 1} of {filteredImages.length}
            </div>
          </div>
        </div>

        {/* Right Controls: View Switcher & Close */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cinema vs Grid View Toggle */}
          <div className="flex items-center bg-[#1C1A17] p-1 rounded-lg border border-[#302D28]">
            <button
              type="button"
              onClick={() => setViewMode("cinema")}
              title="Cinema Slideshow View"
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "cinema"
                  ? "bg-[#C89B4A] text-[#0B0B0A] shadow-xs"
                  : "text-[#A9A39A] hover:text-[#F4EFE5]"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cinema</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid Thumbnail View"
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-[#C89B4A] text-[#0B0B0A] shadow-xs"
                  : "text-[#A9A39A] hover:text-[#F4EFE5]"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid ({filteredImages.length})</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Gallery"
            className="p-2 rounded-full bg-[#1C1A17] hover:bg-[#C89B4A] text-[#A9A39A] hover:text-[#0B0B0A] transition-all border border-[#302D28] hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Category Filter Navigation Bar */}
      {availableCategories.length > 1 && (
        <nav
          aria-label="Photo categories"
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 overflow-x-auto scrollbar-none border-b border-[#302D28]/60 bg-[#121110] z-10"
        >
          {availableCategories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setCurrentIndex(0);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#C89B4A] text-[#0B0B0A] font-bold shadow-md scale-105"
                    : "bg-[#1C1A17] text-[#A9A39A] hover:text-[#F4EFE5] border border-[#302D28] hover:border-[#C89B4A]/50"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-[#0B0B0A]/30 text-[#0B0B0A]" : "bg-[#151412] text-[#A9A39A]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        {viewMode === "cinema" ? (
          /* CINEMA SLIDESHOW MODE */
          <div
            className="relative w-full h-full flex flex-col items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Main Stage Image */}
            <div className="relative w-full h-full max-w-6xl max-h-[70vh] sm:max-h-[75vh] flex items-center justify-center">
              {activeImage && (
                <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                  <Image
                    src={activeImage.url}
                    alt={activeImage.label || `${villaName} photo`}
                    fill
                    sizes="100vw"
                    className="object-contain transition-opacity duration-300"
                    priority
                  />
                </div>
              )}

              {/* Prev Button */}
              {filteredImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/70 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {filteredImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next photo"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/70 hover:bg-[#C89B4A] text-white hover:text-[#0B0B0A] border border-white/20 hover:border-[#C89B4A] flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Subtle Label & Category Caption at Bottom of Image */}
            <div className="flex-shrink-0 pt-2 pb-1 text-center space-y-1 px-4 max-w-xl">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {activeImage?.category && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C89B4A] bg-[#C89B4A]/10 px-2.5 py-0.5 rounded border border-[#C89B4A]/25">
                    <Tag className="w-3 h-3" />
                    <span>{formatCategoryLabel(activeImage.category)}</span>
                  </span>
                )}
                {activeImage?.label && (
                  <span className="text-xs sm:text-sm font-medium text-[#F4EFE5] tracking-wide">
                    {activeImage.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* GRID VIEW MODE */
          <div className="w-full h-full overflow-y-auto px-4 sm:px-8 py-6">
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode("cinema");
                  }}
                  className="group/grid relative aspect-[4/3] rounded-xl overflow-hidden bg-[#1C1A17] border border-[#302D28] hover:border-[#C89B4A] transition-all hover:scale-[1.02] shadow-lg text-left"
                >
                  <Image
                    src={img.url}
                    alt={img.label || `Photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover/grid:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover/grid:opacity-30 transition-opacity" />

                  {/* Badges on Grid Item */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[#C89B4A] border border-[#C89B4A]/30">
                      {img.category ? formatCategoryLabel(img.category) : "Gallery"}
                    </span>
                  </div>

                  {img.label && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-xs text-white font-medium truncate block drop-shadow-md">
                        {img.label}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Thumbnail Filmstrip in Cinema Mode */}
      {viewMode === "cinema" && filteredImages.length > 1 && (
        <footer className="flex-shrink-0 px-4 sm:px-8 py-3 bg-[#151412] border-t border-[#302D28] overflow-hidden">
          <div
            ref={thumbnailStripRef}
            className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-1 scroll-touch-pan justify-start sm:justify-center"
          >
            {filteredImages.map((img, idx) => {
              const isActive = idx === safeCurrentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Jump to photo ${idx + 1}`}
                  className={`relative flex-shrink-0 w-16 h-11 sm:w-20 sm:h-14 rounded-lg overflow-hidden transition-all duration-200 bg-[#1C1A17] ${
                    isActive
                      ? "ring-2 ring-[#C89B4A] ring-offset-2 ring-offset-[#0B0B0A] scale-105 opacity-100 shadow-md"
                      : "opacity-40 hover:opacity-100 border border-[#302D28]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </footer>
      )}
    </div>
  );
}

export function VillaGalleryModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  villaName,
}: VillaGalleryModalProps) {
  if (!isOpen || images.length === 0) return null;

  return (
    <VillaGalleryModalContent
      key={`${isOpen}-${initialIndex}-${images.length}`}
      onClose={onClose}
      images={images}
      initialIndex={initialIndex}
      villaName={villaName}
    />
  );
}
