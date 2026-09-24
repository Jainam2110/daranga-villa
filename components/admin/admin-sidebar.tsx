"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  Tag,
  BookOpenCheck,
  Users,
  CreditCard,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { DarangaLogo } from "@/components/brand/daranga-logo";

interface AdminSidebarProps {
  adminName?: string;
  adminEmail?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  adminName = "Administrator",
  adminEmail = "admin@darangavilla.com",
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin/login";
    } catch (e) {
      console.error("Logout error", e);
      setLoggingOut(false);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin/login";
    }
  };

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Live Bookings", href: "/admin/bookings", icon: BookOpenCheck },
      ],
    },
    {
      title: "PROPERTY MANAGEMENT",
      items: [
        { name: "Villas & Suites", href: "/admin/villas", icon: Home },
        { name: "Hero Slideshow", href: "/admin/hero-slides", icon: CalendarDays },
        { name: "Availability", href: "/admin/availability", icon: CalendarDays },
        { name: "Dynamic Pricing", href: "/admin/pricing", icon: Tag },
      ],
    },
    {
      title: "RELATIONSHIPS & FINANCE",
      items: [
        { name: "Guests & Accounts", href: "/admin/customers", icon: Users },
        { name: "Payments & Invoices", href: "/admin/payments", icon: CreditCard },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#151412] border-r border-[#DDD5C7] dark:border-[#302D28] text-[#171513] dark:text-[#F4EFE5] select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#DDD5C7]/70 dark:border-[#302D28]">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <DarangaLogo variant="monogram" size="sm" />
          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-base font-normal tracking-[0.2em] text-[#171513] dark:text-[#F4EFE5] leading-tight">
              DARANGA VILLA
            </span>
            <span className="text-[9.5px] font-sans font-semibold uppercase text-[#A8792E] dark:text-[#C89B4A] tracking-wider">
              Admin Portal
            </span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#6E685F] dark:text-[#A9A39A]">
              {section.title}
            </h3>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? "bg-[#F5F2EC] dark:bg-[#1C1A17] text-[#A8792E] dark:text-[#C89B4A] font-semibold border-l-2 border-[#A8792E] dark:border-[#C89B4A]"
                        : "text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] hover:bg-[#F5F2EC]/60 dark:hover:bg-[#1C1A17]/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#A8792E] dark:text-[#C89B4A]" : "text-[#6E685F] dark:text-[#A9A39A]"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#DDD5C7]/70 dark:border-[#302D28] bg-[#F5F2EC]/40 dark:bg-[#0B0B0A]/40">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7]/60 dark:border-[#302D28]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#A8792E]/10 dark:bg-[#C89B4A]/20 text-[#A8792E] dark:text-[#C89B4A] font-sans font-semibold text-xs flex items-center justify-center flex-shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-[#171513] dark:text-[#F4EFE5] truncate">
                {adminName}
              </span>
              <span className="text-[10px] text-[#6E685F] dark:text-[#A9A39A] truncate">
                {adminEmail}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="p-1.5 rounded text-[#6E685F] dark:text-[#A9A39A] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />
          <aside className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
