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
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout error", e);
      setLoggingOut(false);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  };

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Live Bookings", href: "/bookings", icon: BookOpenCheck },
      ],
    },
    {
      title: "PROPERTY MANAGEMENT",
      items: [
        { name: "Villas & Suites", href: "/villas", icon: Home },
        { name: "Hero Slideshow", href: "/hero-slides", icon: CalendarDays },
        { name: "Availability", href: "/availability", icon: CalendarDays },
        { name: "Dynamic Pricing", href: "/pricing", icon: Tag },
      ],
    },
    {
      title: "RELATIONSHIPS & FINANCE",
      items: [
        { name: "Guests & Accounts", href: "/customers", icon: Users },
        { name: "Payments & Invoices", href: "/payments", icon: CreditCard },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#202020] dark:bg-[#171717] border-r border-[#383633] text-[#FFFFFF] select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#383633]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <DarangaLogo variant="monogram" size="sm" />
          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-base font-normal tracking-[0.2em] text-[#FFFFFF] leading-tight">
              DARANGA VILLA
            </span>
            <span className="text-[9.5px] font-sans font-semibold uppercase text-[#EFA1AA] tracking-wider">
              Admin Portal
            </span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-[#8A8782] hover:text-[#FFFFFF] hover:bg-white/10"
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
            <h3 className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#8A8782]">
              {section.title}
            </h3>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname === `/admin${item.href}` ||
                  (item.href !== "/dashboard" &&
                    item.href !== "/admin/dashboard" &&
                    (pathname.startsWith(item.href) || pathname.startsWith(`/admin${item.href}`)));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${isActive
                        ? "bg-white/10 text-white font-semibold border-l-2 border-[#EFA1AA]"
                        : "text-[#DAD7D1] hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#EFA1AA]" : "text-[#8A8782]"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#383633] bg-black/20">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5 border border-[#383633]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#EFA1AA]/20 text-[#EFA1AA] font-sans font-semibold text-xs flex items-center justify-center flex-shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-[#FFFFFF] truncate">
                {adminName}
              </span>
              <span className="text-[10px] text-[#8A8782] truncate">
                {adminEmail}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="p-1.5 rounded text-[#8A8782] hover:text-[#B84A4A] hover:bg-white/10 transition-colors"
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
