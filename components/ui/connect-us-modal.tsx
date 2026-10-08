"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { PUBLIC_CONTACT_EMAIL, PUBLIC_CONTACT_PHONE } from "@/lib/constants";

interface ConnectUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectUsModal({ isOpen, onClose }: ConnectUsModalProps) {
  const [name, setName] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const sanitizedWa = PUBLIC_CONTACT_PHONE.replace(/[^0-9]/g, "");

  const handleResetAndClose = () => {
    setName("");
    setInquiry("");
    setIsSubmitted(false);
    onClose();
  };

  const handleSendWhatsApp = () => {
    const message = `Hello Daranga Villas,\n\nName: ${name}\nInquiry: ${inquiry}`;
    window.open(`https://wa.me/${sanitizedWa}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !inquiry.trim()) return;

    setIsSubmitting(true);

    // Open WhatsApp directly with guest's Name and Inquiry pre-filled
    handleSendWhatsApp();

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#202020] rounded-[24px] border border-[#E8E8E8] dark:border-[#383838] p-6 sm:p-8 shadow-2xl space-y-6 text-[#202020] dark:text-[#FCFBF8] animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] flex items-center justify-center text-[#777777] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="text-center space-y-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFA1AA]/15 text-[#202020] dark:text-[#FCFBF9] text-[10px] font-bold uppercase tracking-[0.25em] border border-[#EFA1AA]/30">
                <Mail className="w-3.5 h-3.5 text-[#EFA1AA]" />
                CONNECT WITH US
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#202020] dark:text-[#FCFBF9]">
                Connect With Us
              </h3>
              <p className="text-xs text-[#555555] dark:text-[#BDBDBD] font-light leading-relaxed">
                Enter your details below to message our concierge team directly on WhatsApp.
              </p>
            </div>

            {/* Short & Crisp Form: Name & Inquiry */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label htmlFor="connect-name" className="block text-[11px] uppercase tracking-wider font-semibold text-[#202020] dark:text-[#FCFBF9] mb-1.5">
                  Name <span className="text-[#EFA1AA]">*</span>
                </label>
                <input
                  id="connect-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl bg-[#FCFBF9] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] text-sm text-[#202020] dark:text-white placeholder-[#999999] focus:outline-none focus:border-[#EFA1AA] dark:focus:border-[#EFA1AA] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="connect-inquiry" className="block text-[11px] uppercase tracking-wider font-semibold text-[#202020] dark:text-[#FCFBF9] mb-1.5">
                  Inquiry <span className="text-[#EFA1AA]">*</span>
                </label>
                <textarea
                  id="connect-inquiry"
                  required
                  rows={3}
                  value={inquiry}
                  onChange={(e) => setInquiry(e.target.value)}
                  placeholder="Your Inquiry"
                  className="w-full px-4 py-3 rounded-xl bg-[#FCFBF9] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] text-sm text-[#202020] dark:text-white placeholder-[#999999] focus:outline-none focus:border-[#EFA1AA] dark:focus:border-[#EFA1AA] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full bg-[#202020] dark:bg-[#FCFBF9] text-white dark:text-[#202020] hover:bg-[#171717] dark:hover:bg-white font-semibold text-xs uppercase tracking-[0.18em] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Opening WhatsApp..." : "Submit Inquiry"}</span>
              </button>
            </form>

            <div className="pt-2 text-center border-t border-[#E8E8E8] dark:border-[#383838]">
              <span className="text-[11px] text-[#777777] dark:text-[#BDBDBD]">
                Email:{" "}
                <a
                  href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(PUBLIC_CONTACT_EMAIL)}`, "_blank", "noopener,noreferrer");
                    setTimeout(() => {
                      window.location.href = `mailto:${PUBLIC_CONTACT_EMAIL}`;
                    }, 100);
                  }}
                  className="font-mono text-xs text-[#202020] dark:text-white hover:text-[#EFA1AA] transition-colors underline cursor-pointer"
                >
                  {PUBLIC_CONTACT_EMAIL}
                </a>
              </span>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-[#EFA1AA]/20 text-[#EFA1AA] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl font-normal text-[#202020] dark:text-[#FCFBF9]">
                Inquiry Opened in WhatsApp!
              </h3>
              <p className="text-xs text-[#555555] dark:text-[#BDBDBD] font-light leading-relaxed max-w-xs mx-auto">
                Thank you, <span className="font-semibold text-[#202020] dark:text-white">{name}</span>. Your inquiry has been pre-filled into WhatsApp to connect directly with our concierge.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-3 px-5 rounded-full bg-[#25D366] hover:bg-[#22c35e] text-white font-semibold text-xs uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Re-open WhatsApp Chat</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 px-4 rounded-full bg-stone-100 dark:bg-stone-800 text-[#202020] dark:text-white hover:bg-stone-200 dark:hover:bg-stone-700 font-semibold text-xs uppercase tracking-[0.14em] transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
