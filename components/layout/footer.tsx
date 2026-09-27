import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { DarangaLogo } from "@/components/brand/daranga-logo";

export function Footer() {
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
            <p className="text-sm text-[#202020] dark:text-[#FCFBF9] font-sans font-semibold tracking-wide hover:text-[#EFA1AA] transition-colors">
              concierge@darangavilla.com
            </p>
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
