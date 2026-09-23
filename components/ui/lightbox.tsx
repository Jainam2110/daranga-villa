"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";

interface LightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function Lightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    const newIdx = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(newIdx);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    const newIdx = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIdx);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50 text-[var(--text-primary)]">
        <div className="text-xs uppercase tracking-widest font-mono text-[var(--text-secondary)]">
          {currentIndex + 1} / {images.length}
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--bg-primary)] transition-colors border border-[var(--border-color)]"
          aria-label="Close Lightbox"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full max-w-6xl max-h-[85vh] p-4 sm:p-8 flex items-center justify-center">
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-[var(--border-color)] shadow-2xl">
          <Image
            src={currentImage}
            alt={`Gallery photo ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--accent)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-color)] shadow-xl transition-all hover:scale-105"
            aria-label="Previous Image"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--accent)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-color)] shadow-xl transition-all hover:scale-105"
            aria-label="Next Image"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
