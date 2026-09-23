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
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-[var(--bg-primary)]">
      <Navbar transparentOnTop={false} />

      <main className="flex-1">
        {/* Editorial Listing Header */}
        <section className="bg-[var(--bg-secondary)] text-[var(--text-primary)] pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 relative overflow-hidden border-b border-[var(--border-color)]">
          <Container className="relative z-10 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block">
                PORTFOLIO
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                Our Private Villa Collection
              </h1>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-light">
                Discover bespoke oceanfront sanctuaries, private infinity pools, and serene architectural retreats.
              </p>
            </div>
          </Container>
        </section>

        {/* Villas Grid Section */}
        <section className="py-20 lg:py-28 bg-[var(--bg-primary)]">
          <Container>
            {/* Results Counter Bar */}
            <div className="flex items-center justify-between mb-12 pb-4 border-b border-[var(--border-color)] text-[var(--text-secondary)] text-xs uppercase tracking-wider font-medium">
              <div>
                Showing <strong className="text-[var(--accent)] font-serif font-bold text-sm">{villas.length}</strong> active estate residence{villas.length === 1 ? "" : "s"}
              </div>
              <div className="text-[var(--accent)] font-semibold tracking-[0.2em]">
                Guaranteed Privacy &amp; Concierge Hospitality
              </div>
            </div>

            {/* Empty State */}
            {villas.length === 0 ? (
              <div className="py-20 px-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center max-w-xl mx-auto space-y-5 rounded-[6px]">
                <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                  No Active Villas Available Currently
                </h2>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-light">
                  Our private estate portfolio is currently undergoing seasonal updates. Please check back shortly or log in to the admin portal to publish villa listings.
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin/villas"
                    className="px-6 py-3 bg-[var(--accent)] hover:opacity-90 text-[var(--bg-primary)] text-xs uppercase tracking-[0.2em] font-bold inline-block rounded-[6px]"
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
