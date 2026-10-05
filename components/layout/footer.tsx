import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { DarangaLogo } from "@/components/brand/daranga-logo";
import { PUBLIC_CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/constants";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad-footer" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-grad-footer)" />
      <path
        d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#ffffff" />
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        ry="5"
        stroke="#ffffff"
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  );
}

function YoutubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.37z"
        fill="#FF0000"
      />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#FFFFFF" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C20.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  );
}

export function Footer() {
  const socialItems = [
    {
      name: "Instagram",
      href: SOCIAL_LINKS.instagram,
      icon: InstagramIcon,
      ariaLabel: "Follow Daranga Villas on Instagram",
    },
    {
      name: "YouTube",
      href: SOCIAL_LINKS.youtube,
      icon: YoutubeIcon,
      ariaLabel: "Subscribe to Daranga Villas YouTube channel",
    },
    {
      name: "Facebook",
      href: SOCIAL_LINKS.facebook,
      icon: FacebookIcon,
      ariaLabel: "Follow Daranga Villas on Facebook",
    },
  ];

  return (
    <footer className="bg-[#FCFBF9] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF9] border-t border-[#E8E8E8] dark:border-[#383838] pt-16 sm:pt-20 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12 transition-colors duration-200">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#E8E8E8] dark:border-[#383838]">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-5">
            <div>
              <DarangaLogo
                variant="horizontal"
                size="lg"
                withTagline={true}
                asLink={true}
              />
            </div>
            <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm leading-relaxed font-normal max-w-md pt-1">
              A private luxury sanctuary designed for guests seeking quiet elegance, panoramic natural beauty, and uncompromised hospitality.
            </p>
            <div className="pt-1 text-[10px] uppercase tracking-[0.25em] text-[#EFA1AA] font-semibold">
              Boutique Estate Sanctuary
            </div>

            {/* Social Media Icons with Official Brand Colors */}
            <div className="pt-2 flex items-center gap-3">
              {socialItems.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 cursor-pointer opacity-95 hover:opacity-100 drop-shadow-sm"
                  >
                    <Icon className="w-9 h-9" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3 md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-[#202020] dark:text-[#FCFBF9] font-semibold">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#555555] dark:text-[#BDBDBD] uppercase tracking-wider font-medium">
              <li>
                <Link href="/villas" className="hover:text-[#202020] dark:hover:text-white transition-colors">
                  Villas
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#202020] dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about-udaipur" className="hover:text-[#202020] dark:hover:text-white transition-colors">
                  About Udaipur
                </Link>
              </li>
              <li>
                <Link href="/#experiences" className="hover:text-[#202020] dark:hover:text-white transition-colors">
                  Experiences
                </Link>
              </li>
            </ul>
          </div>

          {/* Residence Information */}
          <div className="space-y-3 md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-[#202020] dark:text-[#FCFBF9] font-semibold">
              Residence
            </h4>
            <ul className="space-y-2.5 text-xs text-[#555555] dark:text-[#BDBDBD] uppercase tracking-wider font-medium">
              <li>
                <Link href="/admin/login" className="hover:text-[#202020] dark:hover:text-white transition-colors">
                  Account / Admin
                </Link>
              </li>
              <li>
                <span className="opacity-60">Private Dining</span>
              </li>
              <li>
                <span className="opacity-60">Concierge Desk</span>
              </li>
            </ul>
          </div>

          {/* Concierge & Inquiries */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-[#202020] dark:text-[#FCFBF9] font-semibold">
              Private Concierge
            </h4>
            <p className="text-xs text-[#555555] dark:text-[#BDBDBD] leading-relaxed font-normal">
              For direct reservation inquiries, private events, or estate buyouts:
            </p>
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="inline-block text-sm text-[#202020] dark:text-[#FCFBF9] font-sans font-semibold tracking-wide hover:text-[#EFA1AA] transition-colors"
            >
              {PUBLIC_CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* Copyright & Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] dark:text-[#BDBDBD] gap-4">
          <p>© {new Date().getFullYear()} Daranga Villa. All rights reserved.</p>
          <p className="font-sans text-xs opacity-75">
            Private Luxury Hospitality • Excellence Guaranteed
          </p>
        </div>
      </Container>
    </footer>
  );
}

