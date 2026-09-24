import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking, { IBooking } from "@/models/Booking";
import Villa from "@/models/Villa";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import {
  AdminBookingsManagementClient,
  SerializedBooking,
  VillaOption,
} from "@/components/admin/admin-bookings-management-client";
import { getVillaAddress } from "@/lib/utils/villa-location";

export default async function AdminBookingsPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  const bookingsRaw = await Booking.find({})
    .populate("villaId", "name title slug location pricePerNight images heroImage address city")
    .sort({ createdAt: -1 })
    .lean<IBooking[]>();

  const villasRaw = await Villa.find({ status: "ACTIVE" })
    .select("_id name title slug maxGuests pricePerNight location")
    .sort({ name: 1 })
    .lean();

  const villasOptions: VillaOption[] = villasRaw.map((v) => ({
    id: String(v._id),
    name: v.name,
    slug: v.slug,
    maxGuests: v.maxGuests || 6,
    pricePerNight: v.pricePerNight || 0,
    location: getVillaAddress(v.location, "Udaipur, Rajasthan"),
  }));

  const serializedBookings: SerializedBooking[] = bookingsRaw.map((b) => {
    const villaObj =
      typeof b.villaId === "object" && b.villaId !== null
        ? (b.villaId as unknown as {
            name?: string;
            title?: string;
            slug?: string;
            location?: string;
            city?: string;
            pricePerNight?: number;
            heroImage?: string;
            images?: string[];
          })
        : {};

    const villaImage =
      villaObj.heroImage ||
      (Array.isArray(villaObj.images) && villaObj.images.length > 0
        ? typeof villaObj.images[0] === "string"
          ? villaObj.images[0]
          : ""
        : "") ||
      "";

    const rawVillaId = b.villaId;
    const villaIdString =
      typeof rawVillaId === "object" && rawVillaId !== null && "_id" in rawVillaId
        ? String((rawVillaId as { _id: unknown })._id)
        : String(rawVillaId || "");

    return {
      _id: String(b._id),
      villaId: villaIdString,
      villaName: villaObj.title || villaObj.name || "Unknown Villa",
      villaSlug: villaObj.slug || "",
      villaLocation: villaObj.location || villaObj.city || "Kutch",
      villaImage,
      pricePerNight: villaObj.pricePerNight || 0,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      guestPhone: b.guestPhone,
      checkIn: b.checkIn ? new Date(b.checkIn).toISOString() : "",
      checkOut: b.checkOut ? new Date(b.checkOut).toISOString() : "",
      guests: b.guests,
      totalAmount: b.totalAmount,
      source: b.source,
      status: b.status,
      paymentStatus: b.paymentStatus,
      razorpayOrderId: b.razorpayOrderId || "",
      razorpayPaymentId: b.razorpayPaymentId || "",
      paymentHoldExpiresAt: b.paymentHoldExpiresAt ? new Date(b.paymentHoldExpiresAt).toISOString() : "",
      externalBookingId: b.externalBookingId || "",
      notes: b.notes || "",
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
    };
  });

  return (
    <AdminLayoutShell adminName={admin.name} adminEmail={admin.email} pageTitle="Bookings">
      <div className="border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171513] dark:text-[#F4EFE5]">
          Bookings &amp; Reservations
        </h1>
        <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-0.5">
          Inspect, search, create manual bookings, and manage guest stay reservations across properties.
        </p>
      </div>

      <AdminBookingsManagementClient
        initialBookings={serializedBookings}
        villas={villasOptions}
      />
    </AdminLayoutShell>
  );
}
