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
      <div className="relative w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Amenities Collection</span>
            </span>
            <h3 className="font-serif text-2xl font-light text-[var(--text-primary)]">
              What this sanctuary offers
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close amenities modal"
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] transition-colors"
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
                className="flex items-center gap-3.5 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent)]/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] shadow-xs">
                  <AmenityIcon name={item} className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-[var(--text-primary)] tracking-wide block truncate">
                    {item}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-light">
                    Included with private residency
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>{amenities.length} Verified Estate Amenities</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[#0B0B0A] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
