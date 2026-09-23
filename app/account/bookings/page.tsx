import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BookingsPageClient } from "@/components/account/bookings-page-client";

export const metadata: Metadata = {
  title: "My Stays & Bookings | Daranga Villa Customer Sanctuary",
  description: "View your stay history and active reservations with Daranga Villa.",
};

export default function AccountBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A]">
          <div className="w-8 h-8 border-2 border-[#C89B4A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingsPageClient />
    </Suspense>
  );
}
