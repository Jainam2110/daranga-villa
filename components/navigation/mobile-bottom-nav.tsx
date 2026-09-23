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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F5F2EC]/95 dark:bg-[#0B0B0A]/95 backdrop-blur-lg border-t border-[#DDD5C7] dark:border-[#302D28] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] transition-colors duration-200"
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
              className={`group flex flex-col items-center justify-center h-full w-full py-1.5 transition-all duration-200 select-none relative focus:outline-none ${
                active
                  ? "text-[#A8792E] dark:text-[#C89B4A]"
                  : "text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5]"
              }`}
            >
              {/* Icon Container with subtle active scale */}
              <div
                className={`relative flex items-center justify-center transition-transform duration-200 ${
                  active ? "scale-110 -translate-y-0.5" : "group-active:scale-95"
                }`}
              >
                <Icon className="w-5 h-5 transition-colors duration-200" />
              </div>

              {/* Text Label */}
              <span
                className={`text-[10px] font-semibold tracking-wider uppercase mt-1 transition-all duration-200 ${
                  active ? "font-bold text-[#A8792E] dark:text-[#C89B4A]" : "font-medium"
                }`}
              >
                {item.label}
              </span>

              {/* Active Golden Micro-Indicator Dot */}
              <span
                className={`absolute top-1.5 w-1 h-1 rounded-full transition-all duration-300 ${
                  active
                    ? "bg-[#A8792E] dark:bg-[#C89B4A] opacity-100 scale-100"
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
