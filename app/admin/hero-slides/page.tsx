import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminHeroManagementClient } from "@/components/admin/admin-hero-management-client";
import { getActiveHeroSlides } from "@/lib/api/hero-slides";
import { connectToDatabase } from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";

export const revalidate = 0;

export default async function AdminHeroSlidesPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  await connectToDatabase();
  const rawSlides = await HeroSlide.find({}).sort({ order: 1, createdAt: 1 }).lean();

  const slides = rawSlides.length > 0
    ? rawSlides.map((s) => ({
        _id: String(s._id),
        id: String(s._id),
        url: s.url,
        title: s.title || "Villas For\nLuxury Living",
        tagline: s.tagline || "DARANGA SANCTUARIES",
        subtitle: s.subtitle || "",
        caption: s.caption || "",
        publicId: s.publicId || "",
        order: s.order ?? 0,
        isActive: s.isActive ?? true,
      }))
    : await getActiveHeroSlides();

  return (
    <AdminLayoutShell
      adminName={admin.name}
      adminEmail={admin.email}
      pageTitle="Hero Slider Management"
    >
      <AdminHeroManagementClient initialSlides={slides} />
    </AdminLayoutShell>
  );
}
