import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { VillaCardsCarousel } from "@/components/ui/villa-cards-carousel";
import { getActiveVillas } from "@/lib/api/villas";

export const revalidate = 0;

export const metadata = {
  title: "Private Villa Portfolio | Daranga Villa",
  description: "Explore our curated portfolio of private luxury villa residences.",
};

export default async function VillasListingPage() {
  const villas = await getActiveVillas();

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF8] dark:bg-[#171717] font-sans text-[#202020] dark:text-[#FCFBF8] selection:bg-[#E8A0A8] selection:text-[#202020]">
      <Navbar transparentOnTop={false} />

      <main className="flex-1">
        {/* Editorial Listing Header */}
        <section className="bg-white dark:bg-[#202020] text-[#202020] dark:text-[#FCFBF8] pt-24 pb-8 sm:pt-28 sm:pb-12 lg:pt-36 lg:pb-16 relative overflow-hidden border-b border-[#E8E6E2] dark:border-[#383633]">
          <Container className="relative z-10 text-center">
            <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8A0A8]/10 border border-[#E8A0A8]/30 text-[#202020] dark:text-[#FCFBF8] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.25em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B99A62]" />
                EXCLUSIVE PORTFOLIO
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#202020] dark:text-[#FCFBF8] leading-tight">
                Our Private Villa Collection
              </h1>
              <p className="text-[#66635F] dark:text-[#BDB8B0] text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto">
                Discover private pool sanctuaries, bespoke hospitality, and serene architectural retreats.
              </p>
            </div>
          </Container>
        </section>

        {/* Villas Grid Section */}
        <section className="pt-6 pb-16 sm:pt-8 sm:pb-20 lg:py-20 bg-[#FCFBF8] dark:bg-[#171717]">
          <Container>
            {/* Results Counter Bar */}
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-[#E8E6E2] dark:border-[#383633] text-[#66635F] dark:text-[#8A8782] text-[10px] sm:text-xs uppercase tracking-wider font-medium">
              <div>
                Showing <strong className="text-[#202020] dark:text-[#FCFBF8] font-serif font-bold text-xs sm:text-sm">{villas.length}</strong> active estate residence{villas.length === 1 ? "" : "s"}
              </div>
              <div className="text-[#B99A62] font-semibold tracking-[0.16em] hidden sm:block">
                Guaranteed Privacy &amp; Concierge Hospitality
              </div>
            </div>

            {/* Empty State */}
            {villas.length === 0 ? (
              <div className="py-20 px-8 bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] text-center max-w-xl mx-auto space-y-5 rounded-[8px] shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                  No Active Villas Available Currently
                </h2>
                <p className="text-[#66635F] dark:text-[#BDB8B0] text-xs leading-relaxed font-light">
                  Our private estate portfolio is currently undergoing seasonal updates. Please check back shortly or log in to the admin portal to publish villa listings.
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin/villas"
                    className="px-6 py-3 bg-[#202020] hover:bg-[#171717] text-white text-xs uppercase tracking-[0.2em] font-bold inline-block rounded-[6px]"
                  >
                    Manage Villas in Admin
                  </Link>
                </div>
              </div>
            ) : (
              <VillaCardsCarousel
                villas={villas}
                gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
              />
            )}
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
