"use client";

import React, { useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { AmenityIcon } from "@/components/ui/amenity-icon";

interface VillaAmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenities: string[];
  villaName: string;
}

export function VillaAmenitiesModal({
  isOpen,
  onClose,
  amenities,
  villaName,
}: VillaAmenitiesModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${villaName} Complete Amenities`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] rounded-[12px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E8E6E2] dark:border-[#383633] bg-[#FCFBF8] dark:bg-[#171717]">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B99A62] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Amenities Collection</span>
            </span>
            <h3 className="font-serif text-2xl font-light text-[#202020] dark:text-[#FCFBF8]">
              What this sanctuary offers
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close amenities modal"
            className="p-2 rounded-full text-[#66635F] dark:text-[#8A8782] hover:text-[#202020] dark:hover:text-[#FCFBF8] hover:bg-[#F7F6F3] dark:hover:bg-[#383633] border border-[#E8E6E2] dark:border-[#383633] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Amenity Grid */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {amenities.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 p-4 rounded-[8px] bg-[#FCFBF8] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] hover:border-[#B99A62]/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-[6px] bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] flex items-center justify-center flex-shrink-0 text-[#202020] dark:text-[#FCFBF8] shadow-xs">
                  <AmenityIcon name={item} className="w-4 h-4 text-[#B99A62]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] tracking-wide block truncate">
                    {item}
                  </span>
                  <span className="text-[10px] text-[#66635F] dark:text-[#8A8782] font-light">
                    Included with private residency
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E8E6E2] dark:border-[#383633] bg-[#FCFBF8] dark:bg-[#171717] flex items-center justify-between text-xs text-[#66635F] dark:text-[#8A8782]">
          <span>{amenities.length} Verified Estate Amenities</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[6px] bg-[#202020] hover:bg-[#171717] text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
