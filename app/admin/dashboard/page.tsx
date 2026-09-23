import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Villa from "@/models/Villa";
import Booking, { IBooking } from "@/models/Booking";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { formatCurrency } from "@/lib/utils/pricing";
import { Home, CalendarCheck, TrendingUp, Sparkles, ArrowRight, Eye } from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  const totalVillas = await Villa.countDocuments({});
  const activeVillas = await Villa.countDocuments({ status: "ACTIVE" });

  const now = new Date();
  const upcomingBookingsCount = await Booking.countDocuments({
    status: { $in: ["CONFIRMED", "PENDING"] },
    checkOut: { $gte: now },
  });

  // Calculate actual revenue from confirmed/completed bookings
  const revenueAggregation = await Booking.aggregate([
    { $match: { status: { $in: ["CONFIRMED", "COMPLETED"] } } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

  // Fetch upcoming bookings with villa population
  const upcomingBookingsRaw = await Booking.find({
    status: { $in: ["CONFIRMED", "PENDING"] },
    checkOut: { $gte: now },
  })
    .populate("villaId", "name slug")
    .sort({ checkIn: 1 })
    .limit(5)
    .lean<IBooking[]>();

  // Fetch recent bookings overall
  const recentBookingsRaw = await Booking.find({})
    .populate("villaId", "name slug")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean<IBooking[]>();

  // Fetch active villas for availability overview
  const villasOverview = await Villa.find({})
    .select("name slug status pricePerNight maxGuests")
    .sort({ name: 1 })
    .lean();

  const serializedUpcomingBookings = upcomingBookingsRaw.map((b) => {
    const villaObj = typeof b.villaId === "object" && b.villaId !== null
      ? (b.villaId as unknown as { name?: string; slug?: string })
      : {};
    return {
      _id: b._id.toString(),
      guestName: b.guestName,
      villaName: villaObj.name || "Villa",
      checkIn: b.checkIn ? new Date(b.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—",
      checkOut: b.checkOut ? new Date(b.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—",
      guests: b.guests,
      totalAmount: b.totalAmount,
      status: b.status,
    };
  });

  const serializedRecentBookings = recentBookingsRaw.map((b) => {
    const villaObj = typeof b.villaId === "object" && b.villaId !== null
      ? (b.villaId as unknown as { name?: string; slug?: string })
      : {};
    return {
      _id: b._id.toString(),
      guestName: b.guestName,
      villaName: villaObj.name || "Villa",
      checkIn: b.checkIn ? new Date(b.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—",
      checkOut: b.checkOut ? new Date(b.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—",
      totalAmount: b.totalAmount,
      status: b.status,
    };
  });

  return (
    <AdminLayoutShell adminName={admin.name} adminEmail={admin.email} pageTitle="Dashboard">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#171513] dark:text-[#F4EFE5]">
            Good day, {admin.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-0.5">
            Here is what is happening with Daranga Villa operations today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/villas"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] hover:bg-[#302D28] dark:hover:bg-[#b0853c] transition-colors shadow-xs"
          >
            Manage Villas
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Villas */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[#6E685F] dark:text-[#A9A39A]">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Total Villas</span>
            <Home className="w-4 h-4 text-[#A8792E] dark:text-[#C89B4A]" />
          </div>
          <div className="font-sans text-3xl font-bold tracking-tight text-[#171513] dark:text-[#F4EFE5]">
            {totalVillas}
          </div>
          <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
            {activeVillas} active in catalog
          </p>
        </div>

        {/* Card 2: Active Villas */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[#6E685F] dark:text-[#A9A39A]">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Active Villas</span>
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="font-sans text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
            {activeVillas}
          </div>
          <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
            Ready for customer reservations
          </p>
        </div>

        {/* Card 3: Upcoming Bookings */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[#6E685F] dark:text-[#A9A39A]">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Upcoming Stays</span>
            <CalendarCheck className="w-4 h-4 text-[#A8792E] dark:text-[#C89B4A]" />
          </div>
          <div className="font-sans text-3xl font-bold tracking-tight text-[#171513] dark:text-[#F4EFE5]">
            {upcomingBookingsCount}
          </div>
          <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
            Confirmed &amp; pending reservations
          </p>
        </div>

        {/* Card 4: Revenue */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[#6E685F] dark:text-[#A9A39A]">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="font-sans text-3xl font-bold tracking-tight text-[#171513] dark:text-[#F4EFE5]">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
            From completed &amp; confirmed stays
          </p>
        </div>
      </div>

      {/* Main Grid: Upcoming Bookings (Left) + Villa Availability Overview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Upcoming Bookings */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151412] rounded-xl border border-[#DDD5C7] dark:border-[#302D28] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DDD5C7]/60 dark:border-[#302D28] pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#171513] dark:text-[#F4EFE5]">
                Upcoming Guest Stays
              </h2>
              <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">
                Next scheduled check-ins across properties
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {serializedUpcomingBookings.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#DDD5C7] dark:border-[#302D28] rounded-lg text-[#6E685F] dark:text-[#A9A39A] text-xs space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-[#6E685F]/50 dark:text-[#A9A39A]/50" />
              <p className="font-medium text-[#171513] dark:text-[#F4EFE5]">No upcoming bookings found</p>
              <p>When guests make reservations, they will appear here.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#DDD5C7]/60 dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] uppercase text-[10px] font-semibold tracking-wider">
                      <th className="pb-2.5 font-medium">Guest</th>
                      <th className="pb-2.5 font-medium">Villa</th>
                      <th className="pb-2.5 font-medium">Check-In</th>
                      <th className="pb-2.5 font-medium">Check-Out</th>
                      <th className="pb-2.5 font-medium text-right">Amount</th>
                      <th className="pb-2.5 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD5C7]/40 dark:divide-[#302D28]/60 text-[#171513] dark:text-[#F4EFE5]">
                    {serializedUpcomingBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-[#F5F2EC]/50 dark:hover:bg-[#1C1A17]/50 transition-colors">
                        <td className="py-3 font-semibold text-[#171513] dark:text-[#F4EFE5]">{b.guestName}</td>
                        <td className="py-3 text-[#6E685F] dark:text-[#A9A39A]">{b.villaName}</td>
                        <td className="py-3 text-[#6E685F] dark:text-[#A9A39A]">{b.checkIn}</td>
                        <td className="py-3 text-[#6E685F] dark:text-[#A9A39A]">{b.checkOut}</td>
                        <td className="py-3 text-right font-semibold font-sans">{formatCurrency(b.totalAmount)}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                              b.status === "CONFIRMED"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                                : b.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                                : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards */}
              <div className="sm:hidden space-y-3">
                {serializedUpcomingBookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-3.5 rounded-lg border border-[#DDD5C7]/70 dark:border-[#302D28] bg-[#F5F2EC]/30 dark:bg-[#0B0B0A]/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#171513] dark:text-[#F4EFE5]">{b.guestName}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#6E685F] dark:text-[#A9A39A]">
                      <span>{b.villaName}</span>
                      <span className="font-semibold font-sans text-[#171513] dark:text-[#F4EFE5]">
                        {formatCurrency(b.totalAmount)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                      {b.checkIn} — {b.checkOut}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column (1/3): Villa Availability & Occupancy Summary */}
        <div className="bg-white dark:bg-[#151412] rounded-xl border border-[#DDD5C7] dark:border-[#302D28] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DDD5C7]/60 dark:border-[#302D28] pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#171513] dark:text-[#F4EFE5]">
                Villa Catalog
              </h2>
              <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">
                Portfolio status overview
              </p>
            </div>
            <Link
              href="/admin/availability"
              className="text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
            >
              Calendar →
            </Link>
          </div>

          {villasOverview.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6E685F] dark:text-[#A9A39A]">
              No villas available in database.
            </div>
          ) : (
            <div className="space-y-2.5">
              {villasOverview.map((villa) => (
                <div
                  key={villa._id.toString()}
                  className="p-3 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/50 dark:border-[#302D28] flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-[#171513] dark:text-[#F4EFE5]">{villa.name}</h4>
                    <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                      {formatCurrency(villa.pricePerNight)} / night • Max {villa.maxGuests} guests
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                      villa.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                    }`}
                  >
                    {villa.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Overall Bookings */}
      <div className="bg-white dark:bg-[#151412] rounded-xl border border-[#DDD5C7] dark:border-[#302D28] p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#DDD5C7]/60 dark:border-[#302D28] pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#171513] dark:text-[#F4EFE5]">
              Recent Activity Log
            </h2>
            <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">
              Latest reservations submitted on the platform
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
          >
            Manage All Bookings →
          </Link>
        </div>

        {serializedRecentBookings.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6E685F] dark:text-[#A9A39A]">
            No recent bookings recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DDD5C7]/60 dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] uppercase text-[10px] font-semibold tracking-wider">
                  <th className="pb-2.5 font-medium">Guest</th>
                  <th className="pb-2.5 font-medium">Villa</th>
                  <th className="pb-2.5 font-medium">Dates</th>
                  <th className="pb-2.5 font-medium text-right">Total</th>
                  <th className="pb-2.5 font-medium text-center">Status</th>
                  <th className="pb-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD5C7]/40 dark:divide-[#302D28]/60 text-[#171513] dark:text-[#F4EFE5]">
                {serializedRecentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#F5F2EC]/50 dark:hover:bg-[#1C1A17]/50 transition-colors">
                    <td className="py-3 font-semibold text-[#171513] dark:text-[#F4EFE5]">{b.guestName}</td>
                    <td className="py-3 text-[#6E685F] dark:text-[#A9A39A]">{b.villaName}</td>
                    <td className="py-3 text-[#6E685F] dark:text-[#A9A39A]">{b.checkIn} – {b.checkOut}</td>
                    <td className="py-3 text-right font-semibold font-sans">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : b.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : b.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href="/admin/bookings"
                        className="inline-flex items-center gap-1 text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
