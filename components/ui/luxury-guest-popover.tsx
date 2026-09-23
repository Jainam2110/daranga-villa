"use client";

import React, { useEffect, useRef } from "react";

interface LuxuryGuestPopoverProps {
  guests: number;
  maxGuests?: number;
  onChangeGuests: (newGuests: number) => void;
  onClose: () => void;
}

export function LuxuryGuestPopover({
  guests,
  maxGuests = 12,
  onChangeGuests,
  onClose,
}: LuxuryGuestPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleDecrement = () => {
    if (guests > 1) {
      onChangeGuests(guests - 1);
    }
  };

  const handleIncrement = () => {
    if (guests < maxGuests) {
      onChangeGuests(guests + 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-3 z-50 w-72 max-w-[calc(100vw-2rem)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[12px] p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[var(--text-primary)]"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--accent)]">
          Guest Selection
        </span>
        <span className="text-[10px] text-[var(--text-secondary)] font-light">
          Max {maxGuests}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-[var(--text-primary)]">Guests</p>
          <p className="text-[11px] text-[var(--text-secondary)] font-light">Ages 13 or above</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={guests <= 1}
            className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-semibold transition-all ${
              guests <= 1
                ? "border-[var(--border-color)] opacity-30 cursor-not-allowed text-[var(--text-secondary)]"
                : "border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#0B0B0A]"
            }`}
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-bold text-[var(--text-primary)]">
            {guests}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={guests >= maxGuests}
            className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-semibold transition-all ${
              guests >= maxGuests
                ? "border-[var(--border-color)] opacity-30 cursor-not-allowed text-[var(--text-secondary)]"
                : "border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#0B0B0A]"
            }`}
          >
            +
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--border-color)] mt-4 text-right">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#0B0B0A] font-semibold text-xs uppercase tracking-wider rounded-[4px] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
