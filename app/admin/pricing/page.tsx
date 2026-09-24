import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Villa, { IVilla } from "@/models/Villa";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPricingClient, SerializedPricingVilla } from "@/components/admin/admin-pricing-client";
import { getVillaAddress } from "@/lib/utils/villa-location";

export default async function AdminPricingPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  const villasRaw = await Villa.find({})
    .sort({ name: 1 })
    .lean<IVilla[]>();

  const serializedVillas: SerializedPricingVilla[] = villasRaw.map((v) => ({
    _id: v._id.toString(),
    name: v.name,
    slug: v.slug,
    location: getVillaAddress(v.location, "Udaipur, Rajasthan"),
    pricePerNight: v.pricePerNight,
    maxGuests: v.maxGuests,
    status: v.status,
  }));

  return (
    <AdminLayoutShell adminName={admin.name} adminEmail={admin.email} pageTitle="Pricing">
      <div className="border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171513] dark:text-[#F4EFE5]">
          Pricing &amp; Rate Management
        </h1>
        <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-0.5">
          Configure nightly base rates, seasonal pricing rules, and property valuation settings.
        </p>
      </div>

      <AdminPricingClient initialVillas={serializedVillas} />
    </AdminLayoutShell>
  );
}
