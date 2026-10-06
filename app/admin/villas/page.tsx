import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Villa, { IVilla } from "@/models/Villa";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { VillaManagementClient, SerializedVilla } from "@/components/admin/villa-management-client";
import { normalizeVillaImage } from "@/lib/utils/image";

export default async function AdminVillasPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/login");
  }

  await connectToDatabase();

  const villasRaw = await Villa.find({}).sort({ createdAt: -1 }).lean<IVilla[]>();

  const serializedVillas: SerializedVilla[] = villasRaw.map((v) => ({
    _id: v._id.toString(),
    name: v.name,
    slug: v.slug,
    description: v.description || "",
    location: v.location || "",
    zone: v.zone || "Udaipur, Rajasthan",
    googleMapsUrl: v.googleMapsUrl || "",
    latitude: v.latitude !== undefined ? v.latitude : 24.5854,
    longitude: v.longitude !== undefined ? v.longitude : 73.7125,
    mapX: v.mapX !== undefined ? v.mapX : 50,
    mapY: v.mapY !== undefined ? v.mapY : 50,
    images: Array.isArray(v.images) ? v.images.map(normalizeVillaImage) : [],
    pricePerNight: v.pricePerNight,
    maxGuests: v.maxGuests,
    bedrooms: v.bedrooms || 1,
    bathrooms: v.bathrooms || 1,
    amenities: v.amenities || [],
    houseRules: v.houseRules || [],
    cancellationPolicy: v.cancellationPolicy || "",
    status: v.status,
    createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: v.updatedAt ? new Date(v.updatedAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <AdminLayoutShell adminName={admin.name} adminEmail={admin.email} pageTitle="Villas">
      <div className="border-b border-[#E8E6E2] dark:border-[#383633] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#202020] dark:text-[#FCFBF8]">
          Villa Portfolio Management
        </h1>
        <p className="text-xs sm:text-sm text-[#66635F] dark:text-[#BDB8B0] mt-0.5">
          Manage luxury villa listings, Cloudinary media galleries, pricing rates, and public availability.
        </p>
      </div>

      <VillaManagementClient initialVillas={serializedVillas} />
    </AdminLayoutShell>
  );
}
