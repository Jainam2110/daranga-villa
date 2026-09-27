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
    <section className="bg-[#FCFBF8] dark:bg-[#171717] border-y border-[#E8E6E2] dark:border-[#383633] pt-8 pb-8 sm:pt-10 sm:pb-8 lg:pt-12 lg:pb-10 text-[#202020] dark:text-[#FCFBF8]">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center items-center divide-x-0 md:divide-x divide-[#E8E6E2] dark:divide-[#383633]">
          {/* Location */}
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B99A62] block">
              LOCATION
            </span>
            <p className="font-serif text-sm font-medium text-[#202020] dark:text-[#FCFBF8] truncate px-2">
              {location}
            </p>
          </div>

          {/* Guests */}
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B99A62] block">
              CAPACITY
            </span>
            <p className="font-serif text-sm font-medium text-[#202020] dark:text-[#FCFBF8]">
              Up to {guests} Guests
            </p>
          </div>

          {/* Bedrooms */}
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B99A62] block">
              BEDROOMS
            </span>
            <p className="font-serif text-sm font-medium text-[#202020] dark:text-[#FCFBF8]">
              {bedrooms} Private Suites
            </p>
          </div>

          {/* Bathrooms */}
          <div className="space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B99A62] block">
              BATHROOMS
            </span>
            <p className="font-serif text-sm font-medium text-[#202020] dark:text-[#FCFBF8]">
              {bathrooms} Bathrooms
            </p>
          </div>

          {/* Price */}
          <div className="space-y-1 col-span-2 md:col-span-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B99A62] block">
              RATES FROM
            </span>
            <p className="font-sans text-sm font-bold text-[#202020] dark:text-[#FCFBF8]">
              {price} <span className="font-sans text-[10px] text-[#66635F] dark:text-[#8A8782] font-normal">/ night</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
