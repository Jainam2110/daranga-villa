import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Compass, Home as HomeIcon, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | Daranga Villas",
  description: "The sanctuary page you requested could not be found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF9] dark:bg-[#171717] font-sans text-[#202020] dark:text-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 sm:py-28">
        <Container>
          <div className="max-w-xl mx-auto text-center space-y-6 bg-white dark:bg-[#202020] p-8 sm:p-12 rounded-3xl border border-[#E8E8E8] dark:border-[#383838] shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#EFA1AA]/15 dark:bg-[#EFA1AA]/20 border border-[#EFA1AA]/30 flex items-center justify-center mx-auto text-[#202020] dark:text-[#FCFBF8]">
              <Compass className="w-8 h-8 text-[#EFA1AA] animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EFA1AA]">
                ERROR 404
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#202020] dark:text-[#FCFBF8] tracking-tight">
                Sanctuary Not Found
              </h1>
              <p className="text-[#555555] dark:text-[#BDBDBD] text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto">
                The page or villa estate you are looking for does not exist, has been moved, or is temporarily offline.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#202020] hover:bg-[#171717] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Return Home</span>
              </Link>
              <Link
                href="/villas"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-transparent border border-[#E8E8E8] dark:border-[#383838] hover:border-[#202020] dark:hover:border-[#FCFBF8] text-[#202020] dark:text-[#FCFBF8] text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200"
              >
                <Building2 className="w-4 h-4" />
                <span>Explore Villas</span>
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
