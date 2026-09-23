"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  adminName?: string;
  adminEmail?: string;
  pageTitle?: string;
}

export function AdminLayoutShell({
  children,
  adminName = "Admin",
  adminEmail = "admin@darangavilla.com",
  pageTitle,
}: AdminLayoutShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] flex font-sans transition-colors duration-200">
      {/* Left Sidebar */}
      <AdminSidebar
        adminName={adminName}
        adminEmail={adminEmail}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          adminName={adminName}
          adminEmail={adminEmail}
          pageTitle={pageTitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
