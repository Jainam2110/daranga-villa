"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Building2, CalendarDays, User } from "lucide-react";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isActive: (pathname: string) => boolean;
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/",
    isActive: (pathname: string) => pathname === "/",
  },
  {
    id: "villas",
    label: "Villas",
    icon: Building2,
    href: "/villas",
    isActive: (pathname: string) =>
      pathname === "/villas" || pathname.startsWith("/villas/"),
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: CalendarDays,
    href: "/account/bookings",
    isActive: (pathname: string) => pathname.startsWith("/account/bookings"),
    requiresAuth: true,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    href: "/account",
    isActive: (pathname: string) =>
      pathname === "/account" ||
      (pathname.startsWith("/account/") && !pathname.startsWith("/account/bookings")),
    requiresAuth: true,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, loading } = useCustomerAuth();

  // Exclude admin pages and authentication screens
  if (!pathname || pathname.startsWith("/admin") || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !loading && !firebaseUser) {
      router.push(`/login?redirect=${encodeURIComponent(item.href)}`);
      return;
    }
    router.push(item.href);
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 dark:bg-[#202020]/98 backdrop-blur-lg border-t border-[#E8E8E8] dark:border-[#383838] shadow-[0_-4px_20px_rgba(32,32,32,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] transition-colors duration-200"
      style={{
        paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item)}
              aria-label={item.label}
              className={`group flex flex-col items-center justify-center h-full w-full py-1.5 transition-all duration-200 select-none relative focus:outline-none cursor-pointer ${
                active
                  ? "text-[#202020] dark:text-[#FCFBF9]"
                  : "text-[#888888] dark:text-[#888888] hover:text-[#202020] dark:hover:text-[#FCFBF9]"
              }`}
            >
              {/* Icon Container */}
              <div
                className={`relative flex items-center justify-center transition-transform duration-200 ${
                  active ? "scale-105 -translate-y-0.5" : "group-active:scale-95"
                }`}
              >
                <Icon className="w-5 h-5 transition-colors duration-200" />
              </div>

              {/* Text Label */}
              <span
                className={`text-[10px] tracking-wider uppercase mt-1 transition-all duration-200 ${
                  active
                    ? "font-bold text-[#202020] dark:text-[#FCFBF9]"
                    : "font-medium text-[#888888]"
                }`}
              >
                {item.label}
              </span>

              {/* Active Blush Micro-Indicator Dot */}
              <span
                className={`absolute top-1.5 w-1 h-1 rounded-full transition-all duration-300 ${
                  active
                    ? "bg-[#EFA1AA] opacity-100 scale-100"
                    : "opacity-0 scale-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
