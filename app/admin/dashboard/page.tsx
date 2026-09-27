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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6E2] dark:border-[#383633] pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#202020] dark:text-[#FCFBF8]">
            Good day, {admin.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#66635F] dark:text-[#BDB8B0] mt-0.5">
            Here is what is happening with Daranga Villa operations today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/villas"
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#202020] hover:bg-[#171717] text-white transition-colors shadow-xs uppercase tracking-wider"
          >
            Manage Villas
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Villas */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[#66635F] dark:text-[#BDB8B0]">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Total Villas</span>
            <Home className="w-4 h-4 text-[#EFA1AA]" />
          </div>
          <div className="font-sans text-3xl font-bold tracking-tight text-[#202020] dark:text-[#FCFBF8]">
            {totalVillas}
          </div>
          <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
            {activeVillas} active in catalog
          </p>
        </div>

        {/* Card 2: Active Villas */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[#66635F] dark:text-[#BDB8B0]">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Active Villas</span>
            <Sparkles className="w-4 h-4 text-[#3F7658]" />
          </div>
          <div className="font-sans text-3xl font-bold tracking-tight text-[#3F7658]">
            {activeVillas}
          </div>
          <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
            Ready for customer reservations
          </p>
        </div>

        {/* Card 3: Upcoming Bookings */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[#66635F] dark:text-[#BDB8B0]">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Upcoming Stays</span>
            <CalendarCheck className="w-4 h-4 text-[#EFA1AA]" />
          </div>
          <div className="font-sans text-3xl font-bold tracking-tight text-[#202020] dark:text-[#FCFBF8]">
            {upcomingBookingsCount}
          </div>
          <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
            Confirmed &amp; pending reservations
          </p>
        </div>

        {/* Card 4: Revenue */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[#66635F] dark:text-[#BDB8B0]">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#3F7658]" />
          </div>
          <div className="font-sans text-3xl font-bold tracking-tight text-[#202020] dark:text-[#FCFBF8]">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
            From completed &amp; confirmed stays
          </p>
        </div>
      </div>

      {/* Main Grid: Upcoming Bookings (Left) + Villa Availability Overview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Upcoming Bookings */}
        <div className="lg:col-span-2 bg-white dark:bg-[#202020] rounded-xl border border-[#E8E8E8] dark:border-[#383633] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8E8E8] dark:border-[#383633] pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#202020] dark:text-[#FCFBF8]">
                Upcoming Guest Stays
              </h2>
              <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">
                Next scheduled check-ins across properties
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] hover:text-[#EFA1AA] transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {serializedUpcomingBookings.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#DAD7D1] dark:border-[#383633] rounded-lg text-[#66635F] dark:text-[#BDB8B0] text-xs space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-[#8A8782]" />
              <p className="font-medium text-[#202020] dark:text-[#FCFBF8]">No upcoming bookings found</p>
              <p>When guests make reservations, they will appear here.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E8E8] dark:border-[#383633] text-[#66635F] dark:text-[#BDB8B0] uppercase text-[10px] font-semibold tracking-wider">
                      <th className="pb-2.5 font-medium">Guest</th>
                      <th className="pb-2.5 font-medium">Villa</th>
                      <th className="pb-2.5 font-medium">Check-In</th>
                      <th className="pb-2.5 font-medium">Check-Out</th>
                      <th className="pb-2.5 font-medium text-right">Amount</th>
                      <th className="pb-2.5 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8E8]/60 dark:divide-[#383633] text-[#202020] dark:text-[#FCFBF8]">
                    {serializedUpcomingBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-[#F7F6F3]/50 dark:hover:bg-[#171717]/50 transition-colors">
                        <td className="py-3 font-semibold text-[#202020] dark:text-[#FCFBF8]">{b.guestName}</td>
                        <td className="py-3 text-[#66635F] dark:text-[#BDB8B0]">{b.villaName}</td>
                        <td className="py-3 text-[#66635F] dark:text-[#BDB8B0]">{b.checkIn}</td>
                        <td className="py-3 text-[#66635F] dark:text-[#BDB8B0]">{b.checkOut}</td>
                        <td className="py-3 text-right font-semibold font-sans">{formatCurrency(b.totalAmount)}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              b.status === "CONFIRMED"
                                ? "bg-[#3F7658]/10 text-[#3F7658] border border-[#3F7658]/30"
                                : b.status === "PENDING"
                                ? "bg-[#D9822B]/10 text-[#D9822B] border border-[#D9822B]/30"
                                : "bg-[#8A8782]/10 text-[#66635F] border border-[#DAD7D1]"
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
                    className="p-3.5 rounded-lg border border-[#E8E8E8] dark:border-[#383633] bg-[#F7F6F3]/40 dark:bg-[#171717]/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#202020] dark:text-[#FCFBF8]">{b.guestName}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          b.status === "CONFIRMED"
                            ? "bg-[#3F7658]/10 text-[#3F7658] border border-[#3F7658]/30"
                            : "bg-[#D9822B]/10 text-[#D9822B] border border-[#D9822B]/30"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#66635F] dark:text-[#BDB8B0]">
                      <span>{b.villaName}</span>
                      <span className="font-semibold font-sans text-[#202020] dark:text-[#FCFBF8]">
                        {formatCurrency(b.totalAmount)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                      {b.checkIn} — {b.checkOut}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column (1/3): Villa Availability & Occupancy Summary */}
        <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#E8E8E8] dark:border-[#383633] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8E8E8] dark:border-[#383633] pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#202020] dark:text-[#FCFBF8]">
                Villa Catalog
              </h2>
              <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">
                Portfolio status overview
              </p>
            </div>
            <Link
              href="/admin/availability"
              className="text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] hover:text-[#EFA1AA] transition-colors"
            >
              Calendar →
            </Link>
          </div>

          {villasOverview.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#66635F] dark:text-[#BDB8B0]">
              No villas available in database.
            </div>
          ) : (
            <div className="space-y-2.5">
              {villasOverview.map((villa) => (
                <div
                  key={villa._id.toString()}
                  className="p-3 rounded-lg bg-[#F7F6F3]/50 dark:bg-[#171717]/50 border border-[#E8E8E8] dark:border-[#383633] flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-[#202020] dark:text-[#FCFBF8]">{villa.name}</h4>
                    <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                      {formatCurrency(villa.pricePerNight)} / night • Max {villa.maxGuests} guests
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      villa.status === "ACTIVE"
                        ? "bg-[#3F7658]/10 text-[#3F7658] border border-[#3F7658]/30"
                        : "bg-[#8A8782]/10 text-[#66635F] border border-[#DAD7D1] dark:border-[#383633]"
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
      <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#E8E8E8] dark:border-[#383633] p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E8E8E8] dark:border-[#383633] pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#202020] dark:text-[#FCFBF8]">
              Recent Activity Log
            </h2>
            <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">
              Latest reservations submitted on the platform
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] hover:text-[#EFA1AA] transition-colors"
          >
            Manage All Bookings →
          </Link>
        </div>

        {serializedRecentBookings.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#66635F] dark:text-[#BDB8B0]">
            No recent bookings recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E8E8] dark:border-[#383633] text-[#66635F] dark:text-[#BDB8B0] uppercase text-[10px] font-semibold tracking-wider">
                  <th className="pb-2.5 font-medium">Guest</th>
                  <th className="pb-2.5 font-medium">Villa</th>
                  <th className="pb-2.5 font-medium">Dates</th>
                  <th className="pb-2.5 font-medium text-right">Total</th>
                  <th className="pb-2.5 font-medium text-center">Status</th>
                  <th className="pb-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8]/60 dark:divide-[#383633] text-[#202020] dark:text-[#FCFBF8]">
                {serializedRecentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#F7F6F3]/50 dark:hover:bg-[#171717]/50 transition-colors">
                    <td className="py-3 font-semibold text-[#202020] dark:text-[#FCFBF8]">{b.guestName}</td>
                    <td className="py-3 text-[#66635F] dark:text-[#BDB8B0]">{b.villaName}</td>
                    <td className="py-3 text-[#66635F] dark:text-[#BDB8B0]">{b.checkIn} – {b.checkOut}</td>
                    <td className="py-3 text-right font-semibold font-sans">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          b.status === "CONFIRMED"
                            ? "bg-[#3F7658]/10 text-[#3F7658] border border-[#3F7658]/30"
                            : b.status === "PENDING"
                            ? "bg-[#D9822B]/10 text-[#D9822B] border border-[#D9822B]/30"
                            : b.status === "CANCELLED"
                            ? "bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/30"
                            : "bg-[#8A8782]/10 text-[#66635F] border border-[#DAD7D1]"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href="/admin/bookings"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] hover:text-[#EFA1AA] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#EFA1AA]" />
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
