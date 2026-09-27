"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { renderAmenityIcon, getAmenityPricing } from "@/components/ui/amenity-icon";

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
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E8E6E2] dark:border-[#383633] bg-[#FCFBF8] dark:bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#E8A0A8] rounded-full flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                Villa Amenities
              </h3>
              <p className="text-xs text-[#66635F] dark:text-[#A8A49E] font-light">
                All features &amp; inclusions for {villaName}
              </p>
            </div>
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

        {/* Modal Body: Amenity Grid matching reference layout */}
        <div className="p-5 sm:p-8 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-5 sm:gap-y-6">
            {amenities.map((item, idx) => {
              const pricing = getAmenityPricing(item);
              return (
                <div key={idx} className="flex items-center gap-3 sm:gap-3.5 group">
                  {/* Square Outline Box */}
                  <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-lg border border-[#D1D5DB] dark:border-[#383633] bg-white dark:bg-[#1E1E1E] flex items-center justify-center p-2 flex-shrink-0 shadow-2xs group-hover:border-[#202020] dark:group-hover:border-[#FCFBF8] transition-colors">
                    {pricing.isPaid && (
                      <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-white dark:bg-[#202020] border border-[#16A34A] text-[#16A34A] text-[9px] font-bold flex items-center justify-center shadow-xs">
                        ₹
                      </span>
                    )}
                    <div className="text-[#374151] dark:text-[#E5E7EB]">
                      {renderAmenityIcon(item, "w-7 h-7 sm:w-8 sm:h-8")}
                    </div>
                  </div>

                  {/* Name & Pricing */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-normal text-[#202020] dark:text-[#FCFBF8] leading-snug line-clamp-2">
                      {item}
                    </span>
                    {pricing.isPaid && pricing.price ? (
                      <span className="text-xs font-semibold text-[#16A34A] mt-0.5">
                        {pricing.price}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8A8782] font-light mt-0.5">
                        Included
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E8E6E2] dark:border-[#383633] bg-[#FCFBF8] dark:bg-[#171717] flex items-center justify-between text-xs text-[#66635F] dark:text-[#8A8782]">
          <span>{amenities.length} Verified Estate Amenities</span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#202020] hover:bg-[#171717] text-white font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
