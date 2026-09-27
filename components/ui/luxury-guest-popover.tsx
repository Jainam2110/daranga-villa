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
      className="absolute top-full right-0 mt-3 z-50 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] rounded-[12px] p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[#202020] dark:text-[#FCFBF8]"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E2] dark:border-[#383633] mb-4">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B99A62]">
          Guest Selection
        </span>
        <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0] font-light">
          Max {maxGuests}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-[#202020] dark:text-[#FCFBF8]">Guests</p>
          <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0] font-light">Ages 13 or above</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={guests <= 1}
            aria-label="Decrease guest count"
            className="w-8 h-8 rounded-full border border-[#DAD7D1] dark:border-[#383633] flex items-center justify-center text-sm font-semibold transition-all text-[#202020] dark:text-[#FCFBF8] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F7F6F3] dark:hover:bg-[#171717] cursor-pointer"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-bold text-[#202020] dark:text-[#FCFBF8]">
            {guests}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={guests >= maxGuests}
            aria-label="Increase guest count"
            className="w-8 h-8 rounded-full border border-[#DAD7D1] dark:border-[#383633] flex items-center justify-center text-sm font-semibold transition-all text-[#202020] dark:text-[#FCFBF8] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F7F6F3] dark:hover:bg-[#171717] cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E8E6E2] dark:border-[#383633] mt-4 text-right">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] dark:bg-[#FCFBF8] dark:hover:bg-[#E8E6E2] dark:text-[#202020] font-semibold text-xs uppercase tracking-wider rounded-[4px] transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
