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
      window.location.href = "/admin/login";
    } catch {
      setLoggingOut(false);
    }
  };

  const getBreadcrumbTitle = () => {
    if (pageTitle) return pageTitle;
    if (pathname.includes("/admin/villas")) return "Villas";
    if (pathname.includes("/admin/availability")) return "Availability";
    if (pathname.includes("/admin/pricing")) return "Pricing";
    if (pathname.includes("/admin/bookings")) return "Bookings";
    if (pathname.includes("/admin/customers")) return "Customers";
    if (pathname.includes("/admin/payments")) return "Payments";
    if (pathname.includes("/admin/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-[#151412]/90 backdrop-blur-md border-b border-[#DDD5C7]/80 dark:border-[#302D28] px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile hamburger + Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17] transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#6E685F] dark:text-[#A9A39A]">
          <span>Admin</span>
          <span>/</span>
          <span className="font-semibold text-[#171513] dark:text-[#F4EFE5]">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right: Status indicator, Theme toggle, Profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Online Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17] transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#C89B4A]" />
            ) : (
              <Moon className="w-4 h-4 text-[#A8792E]" />
            )}
          </button>
        )}

        <div className="h-4 w-px bg-[#DDD5C7] dark:bg-[#302D28] hidden sm:block" />

        {/* Profile Info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] font-sans font-bold text-xs flex items-center justify-center shadow-xs">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-[#171513] dark:text-[#F4EFE5]">
            {adminName}
          </span>
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Logout of admin panel"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
