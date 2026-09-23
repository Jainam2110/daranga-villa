import React, { Suspense } from "react";
import type { Metadata } from "next";
import { LoginClient } from "@/components/auth/login-client";

export const metadata: Metadata = {
  title: "Sign In | Daranga Villa Customer Portal",
  description: "Sign in to manage your private luxury villa stays at Daranga Villa.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A]">
          <div className="w-8 h-8 border-2 border-[#C89B4A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
