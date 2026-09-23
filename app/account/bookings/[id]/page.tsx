import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BookingDetailsClient } from "@/components/account/booking-details-client";

export const metadata: Metadata = {
  title: "Booking Confirmation & Details | Daranga Villa Customer Sanctuary",
  description: "View details of your Daranga Villa stay reservation.",
};

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A]">
          <div className="w-8 h-8 border-2 border-[#C89B4A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingDetailsClient bookingId={id} />
    </Suspense>
  );
}
