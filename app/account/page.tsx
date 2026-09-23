import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ProfilePageClient } from "@/components/account/profile-page-client";

export const metadata: Metadata = {
  title: "Resident Profile | Daranga Villa Customer Sanctuary",
  description: "Manage your Daranga Villa resident profile, contact details, and security.",
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A]">
          <div className="w-8 h-8 border-2 border-[#C89B4A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfilePageClient />
    </Suspense>
  );
}
