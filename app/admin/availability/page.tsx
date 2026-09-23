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
    redirect("/admin/login");
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
      <div className="border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171513] dark:text-[#F4EFE5]">
          Availability &amp; Calendar Management
        </h1>
        <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-0.5">
          Inspect confirmed guest stays, configure owner holds, and block date ranges for maintenance.
        </p>
      </div>

      <AdminAvailabilityCalendarClient villas={villas} />
    </AdminLayoutShell>
  );
}
