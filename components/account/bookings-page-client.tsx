"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DarangaLogo } from "@/components/brand/daranga-logo";
import { Footer } from "@/components/layout/footer";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";
import {
  Calendar,
  ChevronRight,
  MessageCircle,
  Users,
} from "lucide-react";

interface BookingItem {
  id: string;
  villa: {
    _id?: string;
    id?: string;
    title?: string;
    name?: string;
    slug?: string;
    images?: (string | { url?: string })[];
    heroImage?: string;
    address?: string;
    city?: string;
    location?: string;
  } | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentHoldExpiresAt?: string;
  createdAt: string;
}

type StayFilterTab = "ALL" | "UPCOMING" | "PAST" | "CANCELLED";

export function BookingsPageClient() {
  const router = useRouter();
  const { customer, firebaseUser, idToken, loading } = useCustomerAuth();

  const [stayFilter, setStayFilter] = useState<StayFilterTab>("ALL");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);
  const [nowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login?redirect=/account/bookings");
    }
  }, [loading, firebaseUser, router]);

  useEffect(() => {
    async function fetchBookings() {
      if (!idToken) return;
      setLoadingBookings(true);
      try {
        const res = await fetch("/api/customer/bookings", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error("Failed to load customer bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    }

    if (idToken) {
      fetchBookings();
    }
  }, [idToken]);

  if (loading || (!customer && !firebaseUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8] dark:bg-[#171717]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#202020] dark:border-[#B99A62] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#66635F] dark:text-[#BDB8B0]">
            Loading Your Reservations...
          </span>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const upcomingBookings = bookings.filter(
    (b) => b.status !== "CANCELLED" && b.checkOut.split("T")[0] >= todayStr
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== "CANCELLED" && b.checkOut.split("T")[0] < todayStr
  );

  const totalNightsHosted = bookings
    .filter((b) => b.status === "CONFIRMED" || b.paymentStatus === "PAID")
    .reduce((acc, b) => {
      const d1 = new Date(b.checkIn).getTime();
      const d2 = new Date(b.checkOut).getTime();
      const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
      return acc + nights;
    }, 0);

  const filteredBookings = bookings.filter((b) => {
    if (stayFilter === "ALL") return true;
    if (stayFilter === "CANCELLED") return b.status === "CANCELLED";
    if (stayFilter === "UPCOMING") {
      return b.status !== "CANCELLED" && b.checkOut.split("T")[0] >= todayStr;
    }
    if (stayFilter === "PAST") {
      return b.status !== "CANCELLED" && b.checkOut.split("T")[0] < todayStr;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] flex flex-col justify-between">
      
      {/* Top Brand & Navigation Header */}
      <header className="w-full border-b border-[#E8E6E2] dark:border-[#383633] bg-white/90 dark:bg-[#202020]/90 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <DarangaLogo variant="horizontal" size="sm" asLink={true} />
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors hidden sm:inline"
            >
              ← Home
            </Link>
            <Link
              href="/account"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/villas"
              className="px-3.5 py-1.5 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-[11px] font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              Explore Villas
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-20">
        
        {/* ================= 1. BOOKINGS HEADER & SUMMARY BANNER ================= */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#202020] text-white p-5 sm:p-8 border border-[#383633] shadow-xl overflow-hidden mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#B99A62]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#B99A62]/20 border border-[#B99A62]/40 text-[#B99A62] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase inline-block mb-2">
                Sanctuary Itineraries
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-white">
                My Stays &amp; Bookings
              </h1>
              <p className="text-xs sm:text-sm text-[#DAD7D1] font-light mt-1 max-w-lg">
                View upcoming retreats, check-in schedules, active reservation holds, and past visits at Daranga Villa.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <a
                href="https://wa.me/919876543210?text=Hello%20Concierge,%20I%20need%20assistance%20with%20my%20stay%20reservation."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#B99A62]" />
                <span>Concierge Desk</span>
              </a>

              <Link
                href="/villas"
                className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F7F6F3] text-[#202020] text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                Explore Villas
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 pt-5 border-t border-white/10 text-center">
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-[#DAD7D1] uppercase tracking-wider block">Upcoming Stays</span>
              <span className="font-serif text-lg sm:text-2xl text-[#B99A62] font-semibold mt-0.5 block">
                {upcomingBookings.length}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-[#DAD7D1] uppercase tracking-wider block">Past Visits</span>
              <span className="font-serif text-lg sm:text-2xl text-white font-semibold mt-0.5 block">
                {pastBookings.length}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-[#DAD7D1] uppercase tracking-wider block">Nights Hosted</span>
              <span className="font-serif text-lg sm:text-2xl text-[#B99A62] font-semibold mt-0.5 block">
                {totalNightsHosted}
              </span>
            </div>
          </div>
        </div>

        {/* ================= 2. SUB-FILTERS & BOOKING LIST ================= */}
        <div className="p-4 sm:p-7 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-sm space-y-5">
          
          {/* Sub-Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-[#E8E6E2] dark:border-[#383633]">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium text-[#202020] dark:text-[#FCFBF8]">
                Reservation History
              </h2>
              <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] font-light">
                Showing {filteredBookings.length} {stayFilter === "ALL" ? "total" : stayFilter.toLowerCase()} reservation{filteredBookings.length === 1 ? "" : "s"}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#F7F6F3] dark:bg-[#171717] p-1 rounded-xl border border-[#E8E6E2] dark:border-[#383633] overflow-x-auto scrollbar-none">
              {(["ALL", "UPCOMING", "PAST", "CANCELLED"] as StayFilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStayFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                    stayFilter === tab
                      ? "bg-white dark:bg-[#202020] text-[#202020] dark:text-[#FCFBF8] shadow-xs"
                      : "text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {loadingBookings ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#202020] dark:border-[#B99A62] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">Loading your reservations...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 sm:py-16 px-4 text-center border-2 border-dashed border-[#E8E6E2] dark:border-[#383633] rounded-2xl space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F7F6F3] dark:bg-[#171717] flex items-center justify-center mx-auto text-[#66635F] dark:text-[#BDB8B0]">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-light text-[#202020] dark:text-[#FCFBF8]">
                  No {stayFilter.toLowerCase()} reservations registered
                </h3>
                <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] mt-1 max-w-sm mx-auto font-light leading-relaxed">
                  {stayFilter === "ALL"
                    ? "Begin your journey at Daranga Villa by exploring our private sanctuary residences."
                    : `You currently have no ${stayFilter.toLowerCase()} reservations on record.`}
                </p>
              </div>
              <Link
                href="/villas"
                className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-xs uppercase tracking-[0.16em] font-semibold transition-all shadow-md"
              >
                Explore Villa Sanctuaries
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const checkInDateObj = new Date(booking.checkIn);
                const checkOutDateObj = new Date(booking.checkOut);

                const checkInDate = checkInDateObj.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const checkOutDate = checkOutDateObj.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                const diffTime = Math.max(0, checkOutDateObj.getTime() - checkInDateObj.getTime());
                const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

                const isPaidAndConfirmed =
                  booking.paymentStatus === "PAID" || booking.status === "CONFIRMED";
                const isCancelled = booking.status === "CANCELLED";

                const holdExpiresMs = booking.paymentHoldExpiresAt
                  ? new Date(booking.paymentHoldExpiresAt).getTime()
                  : 0;
                const isHoldExpired = Boolean(
                  !isPaidAndConfirmed &&
                    !isCancelled &&
                    booking.status === "PENDING" &&
                    booking.paymentHoldExpiresAt &&
                    holdExpiresMs <= nowMs
                );

                const villaName = booking.villa?.title || booking.villa?.name || "Luxury Villa Residence";
                const bookingRef = `#${booking.id.slice(-8).toUpperCase()}`;

                const thumbnailImage =
                  booking.villa?.heroImage ||
                  (Array.isArray(booking.villa?.images) && booking.villa.images.length > 0
                    ? typeof booking.villa.images[0] === "string"
                      ? booking.villa.images[0]
                      : (booking.villa.images[0] as { url?: string })?.url || ""
                    : "") ||
                  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80";

                return (
                  <Link
                    key={booking.id}
                    href={`/account/bookings/${booking.id}`}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FCFBF8] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-[#202020] dark:hover:border-[#B99A62] hover:shadow-md group block"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
                      {/* Thumbnail */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#202020] flex-shrink-0">
                        <Image
                          src={thumbnailImage}
                          alt={villaName}
                          fill
                          sizes="100px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-base sm:text-lg font-medium text-[#202020] dark:text-[#FCFBF8] group-hover:text-[#B99A62] transition-colors truncate">
                            {villaName}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase border ${
                              isPaidAndConfirmed
                                ? "bg-[#3F6B52]/10 text-[#3F6B52] border-[#3F6B52]/30"
                                : isCancelled
                                ? "bg-[#B84A4A]/10 text-[#B84A4A] border-[#B84A4A]/30"
                                : isHoldExpired
                                ? "bg-[#8A8782]/10 text-[#66635F] border-[#DAD7D1]"
                                : "bg-[#F5D0B5]/30 text-[#B99A62] border-[#B99A62]/30"
                            }`}
                          >
                            {isPaidAndConfirmed
                              ? "CONFIRMED"
                              : isCancelled
                              ? "CANCELLED"
                              : isHoldExpired
                              ? "EXPIRED"
                              : "PENDING"}
                          </span>
                        </div>

                        <div className="text-[11px] sm:text-xs text-[#66635F] dark:text-[#BDB8B0] flex flex-wrap items-center gap-x-3 gap-y-1 font-light">
                          <span className="font-mono font-bold text-[#202020] dark:text-[#FCFBF8]">
                            {bookingRef}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#B99A62]" />
                            <span>{checkInDate} &rarr; {checkOutDate} ({nights}n)</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#B99A62]" />
                            <span>{booking.guests} Guests</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Total & Arrow */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#E8E6E2] dark:border-[#383633]">
                      <div className="text-left md:text-right">
                        <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0]">
                          Total Price
                        </span>
                        <span className="font-serif text-lg sm:text-xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                          ₹{booking.totalAmount?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] group-hover:border-[#202020] dark:group-hover:border-[#B99A62] flex items-center justify-center text-[#66635F] dark:text-[#BDB8B0] group-hover:text-[#202020] dark:group-hover:text-[#FCFBF8] transition-colors flex-shrink-0">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
