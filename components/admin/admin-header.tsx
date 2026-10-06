"use client";

import React, { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

interface AdminHeaderProps {
  adminName?: string;
  adminEmail?: string;
  onOpenMobileMenu?: () => void;
  pageTitle?: string;
}

const emptySubscribe = () => () => {};

export function AdminHeader({
  adminName = "Admin",
  onOpenMobileMenu,
  pageTitle,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    } catch {
      setLoggingOut(false);
    }
  };

  const getBreadcrumbTitle = () => {
    if (pageTitle) return pageTitle;
    if (pathname.includes("villas")) return "Villas";
    if (pathname.includes("availability")) return "Availability";
    if (pathname.includes("pricing")) return "Pricing";
    if (pathname.includes("bookings")) return "Bookings";
    if (pathname.includes("customers")) return "Customers";
    if (pathname.includes("payments")) return "Payments";
    if (pathname.includes("settings")) return "Settings";
    if (pathname.includes("hero-slides")) return "Hero Slides";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-[#202020]/90 backdrop-blur-md border-b border-[#E8E6E2] dark:border-[#383633] px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile hamburger + Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#66635F] dark:text-[#BDB8B0] hover:bg-[#F7F6F3] dark:hover:bg-[#171717] transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#66635F] dark:text-[#BDB8B0]">
          <span>Admin</span>
          <span>/</span>
          <span className="font-semibold text-[#202020] dark:text-[#FCFBF8]">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right: Status indicator, Theme toggle, Profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Online Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3F7658]/10 border border-[#3F7658]/20 text-[11px] font-semibold text-[#3F7658]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3F7658] animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] hover:bg-[#F7F6F3] dark:hover:bg-[#171717] transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#F6D2B8]" />
            ) : (
              <Moon className="w-4 h-4 text-[#202020]" />
            )}
          </button>
        )}

        <div className="h-4 w-px bg-[#E8E6E2] dark:bg-[#383633] hidden sm:block" />

        {/* Profile Info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#202020] dark:bg-[#FFFFFF] text-white dark:text-[#202020] font-sans font-bold text-xs flex items-center justify-center shadow-xs">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-[#202020] dark:text-[#FCFBF8]">
            {adminName}
          </span>
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[#66635F] dark:text-[#BDB8B0] hover:text-[#C94A4A] hover:bg-[#C94A4A]/10 transition-colors"
          title="Logout of admin panel"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
