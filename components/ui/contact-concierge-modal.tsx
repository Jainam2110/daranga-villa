"use client";

import React from "react";
import { Phone, MessageSquare, X, Clock, ShieldCheck } from "lucide-react";

interface ContactConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  whatsappNumber?: string;
}

export function ContactConciergeModal({
  isOpen,
  onClose,
  phoneNumber = "+91 9929822446",
  whatsappNumber,
}: ContactConciergeModalProps) {
  if (!isOpen) return null;

  const rawPhone = phoneNumber.replace(/[^0-9+]/g, "");
  const envWa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || whatsappNumber || rawPhone;
  const sanitizedWa = envWa.replace(/[^0-9]/g, "");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#202020] rounded-[16px] border border-[#E8E6E2] dark:border-[#383633] p-6 sm:p-8 shadow-2xl space-y-6 text-[#202020] dark:text-[#FCFBF8] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] flex items-center justify-center text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFA1AA]/15 text-[#202020] dark:text-[#FCFBF9] text-[10px] font-bold uppercase tracking-[0.25em] border border-[#EFA1AA]/30">
            <Clock className="w-3 h-3 text-[#EFA1AA]" />
            24/7 Dedicated Concierge
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#202020] dark:text-[#FCFBF9]">
            Call Daranga Concierge
          </h3>
          <p className="text-xs text-[#555555] dark:text-[#BDBDBD] font-normal leading-relaxed">
            Speak directly with our estate hospitality team for instant reservations, private celebrations, or customized Udaipur itineraries.
          </p>
        </div>

        {/* Action Options */}
        <div className="space-y-3 pt-2">
          {/* Direct Phone Call */}
          <a
            href={`tel:${rawPhone}`}
            className="w-full p-4 rounded-xl bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF9] dark:hover:bg-[#E8E8E8] dark:text-[#202020] transition-all flex items-center justify-between shadow-md group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white dark:text-[#202020]" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80 block">
                  Direct Phone Call
                </span>
                <span className="font-mono text-sm sm:text-base font-bold tracking-wide">
                  {phoneNumber}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/15 dark:bg-black/10 px-3 py-1.5 rounded-full group-hover:scale-105 transition-transform">
              Call Now
            </span>
          </a>

          {/* WhatsApp Chat Option */}
          {sanitizedWa && (
            <a
              href={`https://wa.me/${sanitizedWa}?text=${encodeURIComponent(
                "Hi, I would like to inquire about booking a stay at Daranga Villa in Udaipur."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#202020] dark:text-[#FCFBF9] transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#25D366] block">
                    Instant WhatsApp
                  </span>
                  <span className="font-serif text-sm sm:text-base font-medium">
                    Chat with Concierge
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#25D366] group-hover:translate-x-0.5 transition-transform">
                Chat &rarr;
              </span>
            </a>
          )}
        </div>

        {/* Guarantee Note */}
        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#555555] dark:text-[#BDBDBD] text-center border-t border-[#E8E8E8] dark:border-[#383838]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3F7658]" />
          <span>Best Rate Guarantee on direct reservations</span>
        </div>
      </div>
    </div>
  );
}
