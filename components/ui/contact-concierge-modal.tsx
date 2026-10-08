"use client";

import React from "react";
import { Phone, MessageSquare, X, Clock, Sparkles } from "lucide-react";

interface ContactConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  whatsappNumber?: string;
}

export function ContactConciergeModal({
  isOpen,
  onClose,
  whatsappNumber = "+919929822446",
}: ContactConciergeModalProps) {
  if (!isOpen) return null;

  const sanitizedWa = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#202020] rounded-[24px] border border-[#E8E8E8] dark:border-[#383838] p-6 sm:p-8 shadow-2xl space-y-6 text-[#202020] dark:text-[#FCFBF8] animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] flex items-center justify-center text-[#777777] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFA1AA]/15 text-[#202020] dark:text-[#FCFBF9] text-[10px] font-bold uppercase tracking-[0.25em] border border-[#EFA1AA]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#EFA1AA]" />
            COMING SOON
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#202020] dark:text-[#FCFBF9]">
            Direct Call Service
          </h3>
          <p className="text-xs text-[#555555] dark:text-[#BDBDBD] font-light leading-relaxed max-w-sm mx-auto">
            Our direct phone calling feature is currently blocked and coming soon. For immediate inquiries or villa reservations, please connect with us on WhatsApp.
          </p>
        </div>

        {/* Action Options */}
        <div className="space-y-3 pt-2">
          {/* Blocked Direct Phone Call Badge */}
          <div className="w-full p-4 rounded-2xl bg-stone-100 dark:bg-[#171717] border border-stone-200 dark:border-stone-800 opacity-80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 block">
                  Direct Phone Calling
                </span>
                <span className="font-serif text-sm font-medium text-stone-700 dark:text-stone-300">
                  Feature Coming Soon
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-3 py-1 rounded-full">
              Blocked
            </span>
          </div>

          {/* WhatsApp Chat Alternative */}
          {sanitizedWa && (
            <a
              href={`https://wa.me/${sanitizedWa}?text=${encodeURIComponent(
                "Hi Daranga Concierge, I would like to inquire about booking a stay at Daranga Villa in Udaipur."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#202020] dark:text-[#FCFBF9] transition-all flex items-center justify-between group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#25D366] block">
                    Available Now
                  </span>
                  <span className="font-serif text-sm sm:text-base font-medium">
                    Chat on WhatsApp
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#25D366] group-hover:translate-x-0.5 transition-transform">
                Chat &rarr;
              </span>
            </a>
          )}
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#777777] dark:text-[#BDBDBD] text-center border-t border-[#E8E8E8] dark:border-[#383838]">
          <Clock className="w-3.5 h-3.5 text-[#EFA1AA]" />
          <span>Direct call line coming soon</span>
        </div>
      </div>
    </div>
  );
}
