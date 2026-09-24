import React from "react";
import { Container } from "@/components/ui/container";
import { Villa } from "@/types/villa";
import { getVillaAddress } from "@/lib/utils/villa-location";

interface HeroInfoStripProps {
  villa?: Villa;
}

export function HeroInfoStrip({ villa }: HeroInfoStripProps) {
  const location = getVillaAddress(villa?.location, "Daranga Estate Sanctuary");
  const guests = villa?.maxGuests || 6;
  const bedrooms = villa?.bedrooms || 3;
  const bathrooms = villa?.bathrooms || 3;
  const price = villa?.pricePerNight ? `₹${villa.pricePerNight.toLocaleString("en-IN")}` : "₹25,000";

  return (
    <section className="bg-[var(--bg-secondary)] border-y border-[var(--border-color)] pt-8 pb-8 sm:pt-10 sm:pb-8 lg:pt-12 lg:pb-10 text-[var(--text-primary)]">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center items-center divide-x-0 md:divide-x divide-[var(--border-color)]">
          {/* Location */}
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] block">
              LOCATION
            </span>
            <p className="font-serif text-sm font-medium text-[var(--text-primary)] truncate px-2">
              {location}
            </p>
          </div>

          {/* Guests */}
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] block">
              CAPACITY
            </span>
            <p className="font-serif text-sm font-medium text-[var(--text-primary)]">
              Up to {guests} Guests
            </p>
          </div>

          {/* Bedrooms */}
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] block">
              BEDROOMS
            </span>
            <p className="font-serif text-sm font-medium text-[var(--text-primary)]">
              {bedrooms} Private Suites
            </p>
          </div>

          {/* Bathrooms */}
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] block">
              BATHROOMS
            </span>
            <p className="font-serif text-sm font-medium text-[var(--text-primary)]">
              {bathrooms} Bathrooms
            </p>
          </div>

          {/* Price */}
          <div className="space-y-1 col-span-2 md:col-span-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)] block">
              RATES FROM
            </span>
            <p className="font-sans text-sm font-bold text-[var(--text-primary)]">
              {price} <span className="font-sans text-[10px] text-[var(--text-secondary)] font-normal">/ night</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
