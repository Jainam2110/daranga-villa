"use client";

import React from "react";
import Image from "next/image";
import { X, Utensils, ChefHat, Sparkles, MessageSquare, ShieldCheck, Flame } from "lucide-react";

interface PrivateDiningModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

const DINING_HIGHLIGHTS = [
  {
    title: "Royal Rajasthani Thali",
    description: "Multi-course imperial feast featuring Dal Baati Churma, Laal Maas, Ker Sangri, and traditional sweets.",
    tag: "HERITAGE FEAST",
    image: "https://i.pinimg.com/1200x/d9/fe/b0/d9feb0ad5321483c93d2311b27e6bb88.jpg",
  },
  {
    title: "Floating Poolside Breakfast",
    description: "Start your morning with fresh tropical fruits, artisanal pastries, and coffee served in floating trays.",
    tag: "MORNING RITUAL",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
  },
];

export function PrivateDiningModal({
  isOpen,
  onClose,
  whatsappNumber = "+919929822446",
}: PrivateDiningModalProps) {
  if (!isOpen) return null;

  const sanitizedWa = whatsappNumber.replace(/[^0-9]/g, "");

  const handleWhatsAppInquiry = (customText?: string) => {
    const text =
      customText ||
      "Hi Daranga Concierge, I would like to inquire about booking a Private Chef & In-Villa Dining experience for my stay.";
    window.open(`https://wa.me/${sanitizedWa}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#202020] rounded-[24px] border border-[#E8E8E8] dark:border-[#383838] p-6 sm:p-8 shadow-2xl space-y-6 text-[#202020] dark:text-[#FCFBF8] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] flex items-center justify-center text-[#777777] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 text-center max-w-lg mx-auto pt-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFA1AA]/15 text-[#202020] dark:text-[#FCFBF9] text-[10px] font-bold uppercase tracking-[0.25em] border border-[#EFA1AA]/30">
            <ChefHat className="w-3.5 h-3.5 text-[#EFA1AA]" />
            BESPOKE CULINARY HAVEN
          </span>

          <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF9] tracking-tight">
            Private In-Villa Dining
          </h2>

          <p className="text-xs sm:text-sm text-[#555555] dark:text-[#BDBDBD] font-light leading-relaxed">
            Savor multi-course gourmet meals, live poolside barbecue grills, and custom royal menus prepared fresh in your villa kitchen by our dedicated private culinary team.
          </p>
        </div>

        {/* Dining Experiences Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {DINING_HIGHLIGHTS.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleWhatsAppInquiry(`Hi, I want to book the ${item.title} for my stay at Daranga Villa.`)}
              className="group relative rounded-2xl overflow-hidden bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.88]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#EFA1AA] text-[9px] font-bold tracking-wider uppercase border border-white/10">
                  {item.tag}
                </span>
              </div>

              <div className="p-3.5 bg-white dark:bg-[#202020] space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-sm font-medium text-[#202020] dark:text-white group-hover:text-[#EFA1AA] transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#555555] dark:text-[#BDBDBD] font-light leading-snug pt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#EFA1AA] inline-flex items-center gap-1 pt-1">
                  <span>Book Experience</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Features & Inclusions */}
        <div className="p-4 rounded-2xl bg-[#FCFBF9] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#202020] dark:text-white uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#EFA1AA]" />
              In-Villa Culinary Privileges
            </span>
            <span className="text-[10px] text-[#EFA1AA] font-mono">100% TAILORED</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#555555] dark:text-[#BDBDBD]">
            <span className="flex items-center gap-1">✓ Private Executive Chef</span>
            <span className="flex items-center gap-1">✓ Personal Butler Service</span>
            <span className="flex items-center gap-1">✓ Fresh Local Ingredients</span>
            <span className="flex items-center gap-1">✓ Custom Dietary Menus</span>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleWhatsAppInquiry()}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-full bg-[#25D366] hover:bg-[#22c35e] text-white font-semibold text-xs uppercase tracking-[0.16em] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Inquire Private Chef via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              const el = document.getElementById("villas") || document.getElementById("booking-widget");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto py-3.5 px-6 rounded-full bg-[#202020] dark:bg-[#FCFBF9] text-white dark:text-[#202020] hover:bg-[#171717] dark:hover:bg-white font-semibold text-xs uppercase tracking-[0.16em] transition-all cursor-pointer shadow-xs"
          >
            <span>Book Villa Residence</span>
          </button>
        </div>

        {/* Bottom Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#777777] dark:text-[#BDBDBD] text-center pt-1 border-t border-[#E8E8E8] dark:border-[#383838]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3F7658]" />
          <span>Private dining is exclusive to Daranga Villa guests</span>
        </div>
      </div>
    </div>
  );
}
