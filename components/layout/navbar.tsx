"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react";
import { DarangaLogo } from "@/components/brand/daranga-logo";

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
    theme === "dark" ? <Sun className="w-3.5 h-3.5 text-[#C89B4A]" /> : <Moon className="w-3.5 h-3.5 text-[#A8792E]" />
  ) : (
    <Sun className="w-3.5 h-3.5 text-[#C89B4A]" />
  );

  const navLinks = [
    { label: "Villas", href: "/villas" },
    { label: "Philosophy", href: "/#experience" },
    { label: "Experiences", href: "/#experiences" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Location", href: "/#location" },
  ];

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-none ${
        isOverlayOnHero
          ? "bg-gradient-to-b from-black/75 via-black/30 to-transparent text-white py-4 sm:py-5"
          : "bg-[#F5F2EC]/90 dark:bg-[#0B0B0A]/90 backdrop-blur-lg text-[#171513] dark:text-[#F4EFE5] py-3 sm:py-3.5 shadow-xs"
      }`}
    >
      <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-5 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between gap-2 lg:gap-3 xl:gap-6 2xl:gap-8 w-full min-w-0">
          
          {/* 1. LEFT: Official Brand Logo (flex-shrink-0) */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group" aria-label="Daranga Villa Home">
              {/* Desktop / Tablet (> 640px): Horizontal DV Monogram + DARANGA VILLA + Tagline (Size MD) */}
              <div className="hidden sm:block">
                <DarangaLogo
                  variant="horizontal"
                  size="md"
                  theme={isOverlayOnHero ? "gold" : "auto"}
                  withTagline={true}
                />
              </div>
              {/* Mobile (<= 640px): Clear DV Monogram + Title + Tagline (Size SM) */}
              <div className="block sm:hidden">
                <DarangaLogo
                  variant="horizontal"
                  size="sm"
                  theme={isOverlayOnHero ? "gold" : "auto"}
                  withTagline={true}
                />
              </div>
            </Link>
          </div>

          {/* 2. CENTER: Navigation Links (Desktop lg+ only, centered to guarantee zero overlap with right actions) */}
          <nav className="hidden lg:flex items-center justify-center gap-2 xl:gap-5 2xl:gap-7 text-[10.5px] xl:text-xs font-medium uppercase tracking-[0.1em] xl:tracking-[0.16em] 2xl:tracking-[0.2em] flex-1 px-1 xl:px-3 min-w-0">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#C89B4A] hover:after:w-full after:transition-all whitespace-nowrap flex-shrink-0 ${
                  isOverlayOnHero
                    ? "text-stone-200 hover:text-white"
                    : "text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 3. RIGHT: Desktop & Mobile Actions (Unclipped & flex-shrink-0) */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 flex-shrink-0">
            
            {/* Desktop User Account / Sign In (Hidden on mobile/tablet, shown on lg+) */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-[10.5px] xl:text-xs font-medium uppercase tracking-[0.1em] xl:tracking-[0.14em] flex-shrink-0">
              {firebaseUser ? (
                <div className="flex items-center gap-1 xl:gap-2">
                  <Link
                    href="/account/bookings"
                    className={`py-1 px-1 transition-colors whitespace-nowrap flex-shrink-0 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#C89B4A] hover:after:w-full after:transition-all ${
                      isOverlayOnHero
                        ? "text-stone-200 hover:text-[#C89B4A]"
                        : "text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5]"
                    }`}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/account"
                    className={`px-2 py-1 xl:px-2.5 xl:py-1.5 rounded-full transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                      isOverlayOnHero
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#171513] dark:text-[#F4EFE5]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C89B4A]" />
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
                        : "text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5]"
                    }`}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Theme Toggle Button (Desktop & Mobile) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-1.5 xl:p-2 rounded-xl transition-all flex-shrink-0 ${
                isOverlayOnHero
                  ? "border border-white/20 hover:bg-white/10 text-white"
                  : "border border-[#DDD5C7]/70 dark:border-[#302D28] hover:bg-[#DDD5C7]/40 dark:hover:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5]"
              }`}
              aria-label="Toggle theme mode"
              title="Toggle theme mode"
            >
              {themeIcon}
            </button>

            {/* Primary CTA (BOOK NOW) - Hidden on Mobile, Prominent on Desktop */}
            <button
              onClick={handleReserveAction}
              className="hidden sm:inline-flex px-3 py-1.5 sm:px-3.5 sm:py-2 xl:px-4.5 xl:py-2.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-[10px] sm:text-[10.5px] xl:text-xs uppercase tracking-[0.14em] xl:tracking-[0.18em] font-bold transition-all shadow-sm hover:scale-[1.02] flex-shrink-0 whitespace-nowrap"
            >
              BOOK NOW
            </button>

            {/* Compact Top-Right Menu Popover Anchor (Mobile & Tablet Only - Hidden on Web View lg+) */}
            <div className="relative lg:hidden flex-shrink-0" ref={menuRef}>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs uppercase tracking-[0.2em] font-semibold transition-all ${
                  isOverlayOnHero
                    ? "border border-white/20 hover:bg-white/10 text-white"
                    : "border border-[#DDD5C7]/70 dark:border-[#302D28] hover:bg-[#DDD5C7]/40 dark:hover:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5]"
                }`}
                aria-label="Toggle Navigation Menu"
                aria-expanded={isMenuOpen}
              >
                <Menu className="w-4 h-4 text-[#C89B4A]" />
                <span className="hidden sm:inline">Menu</span>
              </button>

              {/* Compact Dropdown Popover (Non-blocking, anchored top-right) */}
              {isMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-2.5 w-64 sm:w-72 bg-[#F5F2EC] dark:bg-[#151412] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28] rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5"
                >
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60">
                    <div className="flex items-center gap-2">
                      <DarangaLogo variant="monogram" size="xs" />
                      <div>
                        <span className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-[#A8792E] dark:text-[#C89B4A] block">
                          Daranga Villa
                        </span>
                        <span className="font-serif text-sm font-normal text-[#171513] dark:text-[#F4EFE5]">
                          Resident Access
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 border border-[#DDD5C7]/80 dark:border-[#302D28] hover:border-[#C89B4A] text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] transition-colors flex items-center justify-center"
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
                        className="block px-3 py-2 rounded-xl text-xs font-medium uppercase tracking-[0.16em] text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#DDD5C7]/60 dark:border-[#302D28]/60" />

                  {/* Account / Auth Actions */}
                  {firebaseUser ? (
                    <div className="space-y-2.5">
                      {/* User Info Tile */}
                      <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-[#DDD5C7]/60 dark:border-[#302D28]/60 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#C89B4A]/20 border border-[#C89B4A]/40 text-[#C89B4A] flex items-center justify-center font-serif font-bold text-xs flex-shrink-0">
                          {(customer?.name || firebaseUser?.displayName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-xs font-medium text-[#171513] dark:text-[#F4EFE5] truncate">
                            {customer?.name || firebaseUser?.displayName || "Resident"}
                          </p>
                          <p className="text-[10px] text-[#6E685F] dark:text-[#A9A39A] truncate font-light">
                            {customer?.email || firebaseUser?.email || "Signed In"}
                          </p>
                        </div>
                      </div>

                      {/* My Bookings Link */}
                      <Link
                        href="/account/bookings"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#171513] dark:text-[#F4EFE5] text-xs font-medium uppercase tracking-[0.14em] transition-colors flex items-center justify-between"
                      >
                        <span>My Bookings</span>
                        <span className="text-[#C89B4A] font-bold">→</span>
                      </Link>

                      {/* Profile Link */}
                      <Link
                        href="/account"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#171513] dark:text-[#F4EFE5] text-xs font-medium uppercase tracking-[0.14em] transition-colors flex items-center justify-between"
                      >
                        <span>My Profile</span>
                        <span className="text-[#C89B4A] font-bold">→</span>
                      </Link>

                      {/* Sign Out Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-1.5"
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
                        className="w-full py-2.5 px-3.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-[0.16em] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 text-center"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sign In (Login)</span>
                      </Link>

                      {/* Sign Up (Create Account) */}
                      <Link
                        href="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-[#DDD5C7] dark:border-[#302D28] hover:border-[#C89B4A] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-[#171513] dark:text-[#F4EFE5] text-xs uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center gap-1.5 text-center"
                      >
                        <span>Sign Up (Create Account)</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
