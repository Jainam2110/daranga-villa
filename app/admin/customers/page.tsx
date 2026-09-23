import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking, { IBooking } from "@/models/Booking";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminCustomersClient, SerializedCustomer } from "@/components/admin/admin-customers-client";

export default async function AdminCustomersPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  const bookingsRaw = await Booking.find({})
    .populate("villaId", "name slug")
    .sort({ createdAt: -1 })
    .lean<IBooking[]>();

  // Aggregate customer records by guestEmail or guestPhone
  const customerMap = new Map<string, SerializedCustomer>();

  bookingsRaw.forEach((b) => {
    const key = (b.guestEmail || b.guestPhone || b.guestName).toLowerCase().trim();
    if (!key) return;

    const villaObj = typeof b.villaId === "object" && b.villaId !== null
      ? (b.villaId as unknown as { name?: string; slug?: string })
      : {};

    const bookingItem = {
      _id: b._id.toString(),
      villaName: villaObj.name || "Villa Residence",
      checkIn: b.checkIn ? new Date(b.checkIn).toISOString() : "",
      checkOut: b.checkOut ? new Date(b.checkOut).toISOString() : "",
      guests: b.guests,
      totalAmount: b.totalAmount,
      status: b.status,
    };

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: key,
        name: b.guestName,
        email: b.guestEmail,
        phone: b.guestPhone || "N/A",
        totalBookings: 1,
        totalSpend: b.totalAmount,
        lastBookingDate: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
        bookings: [bookingItem],
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.totalBookings += 1;
      existing.totalSpend += b.totalAmount;
      existing.bookings.push(bookingItem);
      // Keep name & phone updated if previously missing
      if (!existing.phone || existing.phone === "N/A") existing.phone = b.guestPhone;
    }
  });

  const customersList = Array.from(customerMap.values()).sort(
    (a, b) => new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime()
  );

  return (
    <AdminLayoutShell adminName={admin.name} adminEmail={admin.email} pageTitle="Customers">
      <div className="border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171513] dark:text-[#F4EFE5]">
          Guest Directory &amp; Customers
        </h1>
        <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-0.5">
          View customer profiles, reservation history, stay frequency, and total expenditure.
        </p>
      </div>

      <AdminCustomersClient initialCustomers={customersList} />
    </AdminLayoutShell>
  );
}
