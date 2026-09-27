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
        <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9] dark:bg-[#171717]">
          <div className="w-8 h-8 border-2 border-[#202020] dark:border-[#EFA1AA] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfilePageClient />
    </Suspense>
  );
}
