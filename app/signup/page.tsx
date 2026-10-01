import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SignupClient } from "@/components/auth/signup-client";

export const metadata: Metadata = {
  title: "Create Account | Daranga Villas",
  description: "Join Daranga Villas to start planning your private luxury stays.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9] dark:bg-[#171717]">
          <div className="w-8 h-8 border-2 border-[#202020] dark:border-[#EFA1AA] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  );
}
