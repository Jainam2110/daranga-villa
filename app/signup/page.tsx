import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SignupClient } from "@/components/auth/signup-client";

export const metadata: Metadata = {
  title: "Create Account | Daranga Villa Customer Portal",
  description: "Join Daranga Villa to start planning your private luxury stays.",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A]">
          <div className="w-8 h-8 border-2 border-[#C89B4A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  );
}
