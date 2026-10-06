import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Villa, { IVilla } from "@/models/Villa";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminAvailabilityCalendarClient } from "@/components/admin/admin-availability-calendar-client";

export default async function AdminAvailabilityPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/login");
  }

  await connectToDatabase();

  const villasRaw = await Villa.find({ status: "ACTIVE" })
    .sort({ name: 1 })
    .lean<IVilla[]>();

  const villas = villasRaw.map((v) => ({
    id: v._id.toString(),
    name: v.name,
    slug: v.slug,
  }));

  return (
    <AdminLayoutShell adminName={admin.name} adminEmail={admin.email} pageTitle="Availability">
      <div className="border-b border-[#E8E6E2] dark:border-[#383633] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#202020] dark:text-[#FCFBF8]">
          Availability &amp; Calendar Management
        </h1>
        <p className="text-xs sm:text-sm text-[#66635F] dark:text-[#BDB8B0] mt-0.5">
          Inspect confirmed guest stays, configure owner holds, and block date ranges for maintenance.
        </p>
      </div>

      <AdminAvailabilityCalendarClient villas={villas} />
    </AdminLayoutShell>
  );
}
