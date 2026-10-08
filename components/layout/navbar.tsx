"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";
import { Menu, X, Sun, Moon, User, LogOut, Phone } from "lucide-react";
import { DarangaLogo } from "@/components/brand/daranga-logo";
import { ContactConciergeModal } from "@/components/ui/contact-concierge-modal";
import { PUBLIC_CONTACT_PHONE } from "@/lib/constants";

interface NavbarProps {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  maxGuests?: number;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
  onSelectGuests?: (guests: number) => void;
  onCheckAvailability?: () => void;
  onInquireClick?: () => void;
  onReserveClick?: () => void;
  transparentOnTop?: boolean;
}

const emptySubscribe = () => () => {};

export function Navbar({
  onCheckAvailability,
  onReserveClick,
  transparentOnTop = true,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { customer, firebaseUser, logout } = useCustomerAuth();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Scroll detection (for transparent-to-solid transition)
  const isScrolled = useSyncExternalStore(
    emptySubscribe,
    () => (typeof window !== "undefined" ? window.scrollY > 40 : false),
    () => false
  );

  const [, setLocalRerender] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setLocalRerender((v) => v + 1);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menu Dropdown state (compact top-right popup)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleReserveAction = () => {
    setIsMenuOpen(false);
    if (onCheckAvailability) {
      onCheckAvailability();
    } else if (onReserveClick) {
      onReserveClick();
    } else {
      const el = document.getElementById("villas") || document.getElementById("booking-widget");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/villas");
      }
    }
  };

  // Determine visual styling state:
  const isHomePage = pathname === "/";
  const isOverlayOnHero = transparentOnTop && isHomePage && !isScrolled;

  const themeIcon = mounted ? (
    theme === "dark" ? (
      <Sun className={`w-3.5 h-3.5 ${isOverlayOnHero ? "text-white" : "text-[#202020] dark:text-white"}`} />
    ) : (
      <Moon className={`w-3.5 h-3.5 ${isOverlayOnHero ? "text-white" : "text-[#202020]"}`} />
    )
  ) : (
    <Sun className={`w-3.5 h-3.5 ${isOverlayOnHero ? "text-white" : "text-[#202020]"}`} />
  );

  const navLinks = [
    { label: "Villas", href: "/villas" },
    { label: "About Us", href: "/about" },
    { label: "About Udaipur", href: "/about-udaipur" },
    { label: "Experiences", href: "/#experiences" },
  ];

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isOverlayOnHero
          ? "bg-transparent text-white py-4 sm:py-5 border-b border-transparent"
          : "bg-white/95 dark:bg-[#171717]/95 backdrop-blur-md text-[#202020] dark:text-white py-3 sm:py-3.5 border-b border-[#E8E8E8] dark:border-[#383838] shadow-xs"
      }`}
    >
      <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-5 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between gap-2 lg:gap-3 xl:gap-6 2xl:gap-8 w-full min-w-0">
          
          {/* 1. LEFT: Official Brand Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group" aria-label="Daranga Villa Home">
              {/* Desktop / Tablet (> 640px) */}
              <div className="hidden sm:block">
                <DarangaLogo
                  variant="horizontal"
                  size="md"
                  theme={isOverlayOnHero ? "white" : "auto"}
                  withTagline={true}
                />
              </div>
              {/* Mobile (<= 640px) */}
              <div className="block sm:hidden">
                <DarangaLogo
                  variant="horizontal"
                  size="sm"
                  theme={isOverlayOnHero ? "white" : "auto"}
                  withTagline={true}
                />
              </div>
            </Link>
          </div>

          {/* 2. CENTER: Navigation Links (Desktop lg+ only) */}
          <nav className="hidden lg:flex items-center justify-center gap-2 xl:gap-5 2xl:gap-7 text-[10.5px] xl:text-xs font-medium uppercase tracking-[0.1em] xl:tracking-[0.16em] 2xl:tracking-[0.2em] flex-1 px-1 xl:px-3 min-w-0">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#202020] dark:after:bg-white hover:after:w-full after:transition-all whitespace-nowrap flex-shrink-0 ${
                  isOverlayOnHero
                    ? "text-stone-200 hover:text-white after:bg-white"
                    : "text-[#555555] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 3. RIGHT: Desktop & Mobile Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 flex-shrink-0">
            
            {/* Desktop User Account / Sign In */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-[10.5px] xl:text-xs font-medium uppercase tracking-[0.1em] xl:tracking-[0.14em] flex-shrink-0">
              {firebaseUser ? (
                <div className="flex items-center gap-1 xl:gap-2">
                  <Link
                    href="/account/bookings"
                    className={`py-1 px-1 transition-colors whitespace-nowrap flex-shrink-0 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#202020] dark:after:bg-white hover:after:w-full after:transition-all ${
                      isOverlayOnHero
                        ? "text-stone-200 hover:text-white after:bg-white"
                        : "text-[#555555] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white"
                    }`}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/account"
                    className={`px-2 py-1 xl:px-2.5 xl:py-1.5 rounded-full transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                      isOverlayOnHero
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#202020] dark:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EFA1AA]" />
                    <span className="text-[10px] xl:text-[11px] font-semibold tracking-wider">
                      {customer?.name?.split(" ")[0] || "Account"}
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className={`py-1 px-1 transition-colors text-[10.5px] xl:text-xs whitespace-nowrap flex-shrink-0 ${
                      isOverlayOnHero
                        ? "text-stone-200 hover:text-white"
                        : "text-[#555555] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white"
                    }`}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Call Us Button */}
            <a
              href={`tel:${PUBLIC_CONTACT_PHONE}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs flex-shrink-0 ${
                isOverlayOnHero
                  ? "bg-black/75 hover:bg-black text-white border border-white/20 hover:border-white/40"
                  : "bg-[#202020] hover:bg-[#171717] text-white dark:bg-white dark:hover:bg-stone-200 dark:text-[#202020] border border-transparent"
              }`}
              aria-label="Call Daranga Concierge"
            >
              <Phone className="w-3.5 h-3.5 text-white dark:text-[#202020]" />
              <span className="tracking-wide">Call Us</span>
            </a>

            {/* Theme Toggle Button (Desktop Only: hidden on mobile, placed inside Menu popover on mobile) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`hidden lg:flex p-1.5 xl:p-2 rounded-[6px] transition-all flex-shrink-0 cursor-pointer ${
                isOverlayOnHero
                  ? "border border-white/30 bg-black/40 hover:bg-white/20 text-white"
                  : "border border-[#E8E8E8] dark:border-[#383838] bg-white dark:bg-[#202020] hover:bg-[#F7F7F6] dark:hover:bg-[#2A2825] text-[#202020] dark:text-white"
              }`}
              aria-label="Toggle theme mode"
              title="Toggle theme mode"
            >
              {themeIcon}
            </button>

            {/* Primary CTA (BOOK NOW) */}
            <button
              onClick={handleReserveAction}
              className={`hidden sm:inline-flex px-3.5 py-1.5 sm:px-4 sm:py-2 xl:px-5 xl:py-2.5 rounded-[8px] text-[10px] sm:text-[10.5px] xl:text-xs uppercase tracking-[0.14em] xl:tracking-[0.18em] font-semibold transition-all shadow-sm hover:scale-[1.02] flex-shrink-0 whitespace-nowrap cursor-pointer ${
                isOverlayOnHero
                  ? "bg-[#202020] hover:bg-[#171717] text-white border border-white/20"
                  : "bg-[#202020] hover:bg-[#171717] text-white dark:bg-white dark:hover:bg-stone-200 dark:text-[#202020]"
              }`}
            >
              BOOK NOW
            </button>

            {/* Compact Top-Right Menu Popover Anchor (Mobile & Tablet Only) */}
            <div className="relative lg:hidden flex-shrink-0" ref={menuRef}>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer ${
                  isOverlayOnHero
                    ? "border border-white/30 bg-black/40 hover:bg-white/20 text-white"
                    : "border border-[#E8E8E8] dark:border-[#383838] bg-white dark:bg-[#202020] hover:bg-[#F7F7F6] dark:hover:bg-[#2A2825] text-[#202020] dark:text-white"
                }`}
                aria-label="Toggle Navigation Menu"
                aria-expanded={isMenuOpen}
              >
                <Menu className={`w-4 h-4 ${isOverlayOnHero ? "text-white" : "text-[#202020] dark:text-white"}`} />
                <span className={`hidden sm:inline ${isOverlayOnHero ? "text-white" : ""}`}>Menu</span>
              </button>

              {/* Compact Dropdown Popover */}
              {isMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-2.5 w-64 sm:w-72 bg-white dark:bg-[#202020] text-[#202020] dark:text-white border border-[#E8E8E8] dark:border-[#383838] rounded-[16px] p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5"
                >
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E8E8E8] dark:border-[#383838]">
                    <div className="flex items-center gap-2">
                      <DarangaLogo variant="monogram" size="xs" />
                      <div>
                        <span className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-[#202020] dark:text-white block">
                          Daranga Villa
                        </span>
                        <span className="font-serif text-sm font-normal text-[#555555] dark:text-[#BDBDBD]">
                          Resident Access
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-6 h-6 rounded-full bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] hover:border-[#202020] text-[#777777] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                      aria-label="Close Menu"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Navigation Links for Mobile */}
                  <div className="space-y-1 py-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 rounded-[8px] text-xs font-medium uppercase tracking-[0.16em] text-[#555555] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white hover:bg-[#F7F7F6] dark:hover:bg-[#171717] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Theme Mode Switcher */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-xs font-medium uppercase tracking-[0.14em] text-[#555555] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-white bg-[#F7F7F6] dark:bg-[#171717] hover:bg-[#E8E8E8] dark:hover:bg-[#2A2825] transition-colors cursor-pointer border border-[#E8E8E8] dark:border-[#383838]"
                  >
                    <span className="flex items-center gap-2">
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-500" />
                      )}
                      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[#202020] dark:text-white">
                      {theme === "dark" ? "Dark" : "Light"}
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-[#E8E8E8] dark:border-[#383838]" />

                  {/* Account / Auth Actions */}
                  {firebaseUser ? (
                    <div className="space-y-2.5">
                      {/* User Info Tile */}
                      <div className="p-2.5 rounded-[10px] bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#DDEEFF] text-[#202020] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {(customer?.name || firebaseUser?.displayName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-xs font-medium text-[#202020] dark:text-white truncate">
                            {customer?.name || firebaseUser?.displayName || "Resident"}
                          </p>
                          <p className="text-[10px] text-[#777777] dark:text-[#BDBDBD] truncate font-light">
                            {customer?.email || firebaseUser?.email || "Signed In"}
                          </p>
                        </div>
                      </div>

                      {/* My Bookings Link */}
                      <Link
                        href="/account/bookings"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-[8px] bg-[#F7F7F6] dark:bg-[#171717] hover:bg-[#E8E8E8] dark:hover:bg-[#2A2825] text-[#202020] dark:text-white text-xs font-medium uppercase tracking-[0.14em] transition-colors flex items-center justify-between"
                      >
                        <span>My Bookings</span>
                        <span className="text-[#202020] dark:text-white font-bold">→</span>
                      </Link>

                      {/* Profile Link */}
                      <Link
                        href="/account"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-[8px] bg-[#F7F7F6] dark:bg-[#171717] hover:bg-[#E8E8E8] dark:hover:bg-[#2A2825] text-[#202020] dark:text-white text-xs font-medium uppercase tracking-[0.14em] transition-colors flex items-center justify-between"
                      >
                        <span>My Profile</span>
                        <span className="text-[#202020] dark:text-white font-bold">→</span>
                      </Link>

                      {/* Sign Out Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 rounded-[8px] border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-[#C94A4A] text-[11px] uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-0.5">
                      {/* Sign In (Login) */}
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2.5 px-3.5 rounded-[8px] bg-[#202020] hover:bg-[#171717] text-white dark:bg-white dark:text-[#202020] text-xs uppercase tracking-[0.16em] font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 text-center"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </Link>

                      {/* Sign Up (Create Account) */}
                      <Link
                        href="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2.5 px-3.5 rounded-[8px] border border-[#DCDCDC] dark:border-[#383838] hover:border-[#202020] bg-white dark:bg-[#202020] hover:bg-[#F7F7F6] dark:hover:bg-[#2A2825] text-[#202020] dark:text-white text-xs uppercase tracking-[0.16em] font-medium transition-all flex items-center justify-center gap-1.5 text-center"
                      >
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Concierge Call & Inquiry Modal */}
      <ContactConciergeModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </header>
  );
}
