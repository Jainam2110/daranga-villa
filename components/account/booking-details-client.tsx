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
  Users,
  CreditCard,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Bed,
  Bath,
  ExternalLink,
} from "lucide-react";

export interface BookingDetail {
  id: string;
  _id?: string;
  villa: {
    _id?: string;
    id?: string;
    title?: string;
    name?: string;
    slug?: string;
    images?: string[];
    heroImage?: string;
    address?: string;
    city?: string;
    location?: string;
    pricePerNight?: number;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    amenities?: string[];
  } | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  source?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | string;
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentHoldExpiresAt?: string;
  notes?: string;
  createdAt: string;
}

export function BookingDetailsClient({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { firebaseUser, idToken, loading: authLoading } = useCustomerAuth();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Live countdown state for pending hold
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push(`/login?redirect=/account/bookings/${bookingId}`);
    }
  }, [authLoading, firebaseUser, router, bookingId]);

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!idToken || !bookingId) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/customer/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Unable to load booking details.");
          setBooking(null);
        } else {
          setBooking(data.booking);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error loading booking.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    if (idToken) {
      fetchBookingDetails();
    }
  }, [idToken, bookingId]);

  // Update nowMs every second if there's a pending hold
  useEffect(() => {
    if (!booking || booking.status !== "PENDING" || !booking.paymentHoldExpiresAt) {
      return;
    }
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [booking]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C89B4A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#6E685F] dark:text-[#A9A39A]">
            Verifying Reservation Details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] flex flex-col justify-between">
        {/* Top Header Bar */}
        <header className="w-full border-b border-[#DDD5C7]/70 dark:border-[#302D28] bg-white/70 dark:bg-[#151412]/70 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <DarangaLogo variant="horizontal" size="sm" asLink={true} />
            <Link
              href="/account/bookings"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] transition-colors"
            >
              ← My Bookings
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16">
          <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">
                Access Error
              </span>
              <h1 className="font-serif text-3xl font-light text-[#171513] dark:text-[#F4EFE5]">
                Booking Not Available
              </h1>
              <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] max-w-md mx-auto font-light">
                {error || "The requested booking reservation could not be found or does not belong to your account."}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/account/bookings"
                className="px-6 py-3 rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-sm inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to My Bookings</span>
              </Link>
              <Link
                href="/villas"
                className="px-6 py-3 rounded-lg border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold uppercase tracking-[0.18em] text-[#171513] dark:text-[#F4EFE5] hover:border-[#C89B4A] transition-colors"
              >
                Explore Villas
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Calculate Dates & Duration
  const checkInDateObj = new Date(booking.checkIn);
  const checkOutDateObj = new Date(booking.checkOut);
  const diffTime = Math.max(0, checkOutDateObj.getTime() - checkInDateObj.getTime());
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const checkInFormatted = checkInDateObj.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const checkOutFormatted = checkOutDateObj.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Booking & Hold Status calculations
  const isPaidAndConfirmed =
    booking.paymentStatus === "PAID" || booking.status === "CONFIRMED";
  const isCancelled = booking.status === "CANCELLED";

  const holdExpiresMs = booking.paymentHoldExpiresAt
    ? new Date(booking.paymentHoldExpiresAt).getTime()
    : 0;
  const remainingMs = Math.max(0, holdExpiresMs - nowMs);
  const isHoldExpired = Boolean(
    !isPaidAndConfirmed &&
      !isCancelled &&
      booking.status === "PENDING" &&
      booking.paymentHoldExpiresAt &&
      remainingMs <= 0
  );

  const remainingSecondsTotal = Math.floor(remainingMs / 1000);
  const remainingMinutes = Math.floor(remainingSecondsTotal / 60);
  const remainingSeconds = remainingSecondsTotal % 60;
  const formattedTimer = `${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

  const villaName = booking.villa?.title || booking.villa?.name || "Daranga Villa Residence";
  const villaSlug = booking.villa?.slug || "";
  const villaImage =
    booking.villa?.heroImage ||
    (Array.isArray(booking.villa?.images) && booking.villa.images.length > 0
      ? typeof booking.villa.images[0] === "string"
        ? booking.villa.images[0]
        : (booking.villa.images[0] as { url?: string })?.url || ""
      : "") ||
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80";

  const villaLocation = booking.villa?.location || booking.villa?.city || "Kutch, Gujarat";
  const pricePerNight = booking.villa?.pricePerNight || Math.round(booking.totalAmount / nights);
  const bookingReference = `#${(booking.id || booking._id || "").slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="w-full border-b border-[#DDD5C7]/70 dark:border-[#302D28] bg-white/70 dark:bg-[#151412]/70 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <DarangaLogo variant="horizontal" size="sm" asLink={true} />
          
          <div className="flex items-center gap-3">
            <Link
              href="/account/bookings"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] transition-colors"
            >
              ← My Bookings
            </Link>
            <Link
              href="/villas"
              className="px-3.5 py-1.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-[11px] font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              Explore Villas
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/account/bookings"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6E685F] dark:text-[#A9A39A] hover:text-[#C89B4A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </Link>
        </div>

        {/* Main Status Header Card */}
        <div className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm mb-6 sm:mb-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border flex-shrink-0 ${
                  isPaidAndConfirmed
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : isCancelled
                    ? "bg-stone-500/10 text-stone-500 border-stone-500/30"
                    : isHoldExpired
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                }`}
              >
                {isPaidAndConfirmed ? (
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
                ) : isCancelled || isHoldExpired ? (
                  <XCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                ) : (
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full border ${
                      isPaidAndConfirmed
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : isCancelled
                        ? "bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/30"
                        : isHoldExpired
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {isPaidAndConfirmed
                      ? "BOOKING CONFIRMED"
                      : isCancelled
                      ? "BOOKING CANCELLED"
                      : isHoldExpired
                      ? "HOLD EXPIRED"
                      : "RESERVATION PENDING"}
                  </span>
                </div>

                <h1 className="font-serif text-xl sm:text-3xl font-light text-[#171513] dark:text-[#F4EFE5] mt-1 truncate">
                  {isPaidAndConfirmed
                    ? "Your Sanctuary Stay is Confirmed!"
                    : isCancelled
                    ? "Reservation Cancelled"
                    : isHoldExpired
                    ? "Payment Hold Expired"
                    : "Payment Pending"}
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto border-[#DDD5C7] dark:border-[#302D28]">
              <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                Booking Reference
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#A8792E] dark:text-[#C89B4A]">
                {bookingReference}
              </span>
            </div>
          </div>

          {/* Subtext description & Hold Timer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] font-light max-w-xl leading-relaxed">
              {isPaidAndConfirmed
                ? "Payment has been verified and your stay reservation is fully locked into our system. We look forward to hosting you at Daranga Villa."
                : isCancelled
                ? "This booking request was cancelled."
                : isHoldExpired
                ? "Your 15-minute temporary hold on these dates has expired. Please choose your stay dates again to start a new booking."
                : "Your reservation request is saved. Complete your payment before the hold timer expires to lock in your dates."}
            </p>

            {!isPaidAndConfirmed && !isCancelled && !isHoldExpired && booking.paymentHoldExpiresAt && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Hold expires in {formattedTimer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* LEFT COLUMN: Villa Visual & Specs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] overflow-hidden shadow-sm">
              <div className="relative h-48 sm:h-64 w-full bg-[#1c1917]">
                <Image
                  src={villaImage}
                  alt={villaName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-[#C89B4A] block mb-0.5">
                    Private Villa Residence
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-normal text-white truncate">
                    {villaName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/80 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C89B4A]" />
                    <span>{villaLocation}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 rounded-xl border border-[#DDD5C7]/50 dark:border-[#302D28]/50">
                  <div>
                    <span className="block text-[9px] sm:text-[10px] text-[#6E685F] dark:text-[#A9A39A] uppercase font-semibold">Guests</span>
                    <span className="font-medium text-[#171513] dark:text-[#F4EFE5] flex items-center justify-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                      <Users className="w-3.5 h-3.5 text-[#C89B4A]" />
                      {booking.guests} Max
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] sm:text-[10px] text-[#6E685F] dark:text-[#A9A39A] uppercase font-semibold">Bedrooms</span>
                    <span className="font-medium text-[#171513] dark:text-[#F4EFE5] flex items-center justify-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                      <Bed className="w-3.5 h-3.5 text-[#C89B4A]" />
                      {booking.villa?.bedrooms || 2} Beds
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] sm:text-[10px] text-[#6E685F] dark:text-[#A9A39A] uppercase font-semibold">Baths</span>
                    <span className="font-medium text-[#171513] dark:text-[#F4EFE5] flex items-center justify-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                      <Bath className="w-3.5 h-3.5 text-[#C89B4A]" />
                      {booking.villa?.bathrooms || 2} Baths
                    </span>
                  </div>
                </div>

                {villaSlug && (
                  <Link
                    href={`/villas/${villaSlug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline pt-1"
                  >
                    <span>View Villa Sanctuary Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Reservation Summary & Guest Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stay Dates Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-4 sm:space-y-5">
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#171513] dark:text-[#F4EFE5] pb-3 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C89B4A]" />
                <span>Stay Schedule</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/60 dark:border-[#302D28]/60 space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                    Check-In Date
                  </span>
                  <div className="font-serif text-sm sm:text-base font-medium text-[#171513] dark:text-[#F4EFE5]">
                    {checkInFormatted}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#6E685F] dark:text-[#A9A39A] block">
                    From 2:00 PM
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/60 dark:border-[#302D28]/60 space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                    Check-Out Date
                  </span>
                  <div className="font-serif text-sm sm:text-base font-medium text-[#171513] dark:text-[#F4EFE5]">
                    {checkOutFormatted}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#6E685F] dark:text-[#A9A39A] block">
                    Until 11:00 AM
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 sm:pt-2">
                <span className="text-[#6E685F] dark:text-[#A9A39A]">Total Duration:</span>
                <span className="font-medium text-[#171513] dark:text-[#F4EFE5]">
                  {nights} Night{nights > 1 ? "s" : ""} • {booking.guests} Guests
                </span>
              </div>
            </div>

            {/* Guest Contact Info */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-4">
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#171513] dark:text-[#F4EFE5] pb-3 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C89B4A]" />
                <span>Primary Guest Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
                <div>
                  <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-0.5">
                    Guest Name
                  </span>
                  <span className="font-medium text-[#171513] dark:text-[#F4EFE5] block truncate">
                    {booking.guestName}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-0.5">
                    Email Address
                  </span>
                  <span className="font-medium text-[#171513] dark:text-[#F4EFE5] block break-all">
                    {booking.guestEmail}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-0.5">
                    Contact Phone
                  </span>
                  <span className="font-medium text-[#171513] dark:text-[#F4EFE5] block">
                    {booking.guestPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Authority & Payment Summary */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-4 text-xs">
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#171513] dark:text-[#F4EFE5] pb-3 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C89B4A]" />
                <span>Financial & Payment Authority</span>
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[#6E685F] dark:text-[#A9A39A]">
                  <span>Nightly Rate (₹{pricePerNight.toLocaleString("en-IN")} × {nights}n)</span>
                  <span className="font-medium text-[#171513] dark:text-[#F4EFE5]">
                    ₹{(pricePerNight * nights).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#6E685F] dark:text-[#A9A39A]">
                  <span>Taxes & Service Privileges</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Included</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#DDD5C7]/60 dark:border-[#302D28]/60">
                  <span className="font-serif text-sm sm:text-base font-medium text-[#171513] dark:text-[#F4EFE5]">
                    Total Reservation Price
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#A8792E] dark:text-[#C89B4A]">
                    ₹{booking.totalAmount?.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#DDD5C7]/60 dark:border-[#302D28]/60 text-[11px]">
                  <span className="text-[#6E685F] dark:text-[#A9A39A]">Payment Status</span>
                  <span
                    className={`px-3 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      isPaidAndConfirmed
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : isHoldExpired
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {booking.paymentStatus}
                  </span>
                </div>

                {booking.razorpayPaymentId && (
                  <div className="flex justify-between items-center text-[10px] text-[#6E685F] dark:text-[#A9A39A]">
                    <span>Payment ID:</span>
                    <span className="font-mono">{booking.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Link
                href="/account/bookings"
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold uppercase tracking-[0.16em] text-[#171513] dark:text-[#F4EFE5] hover:border-[#C89B4A] transition-colors min-h-[42px] flex items-center justify-center"
              >
                Back to My Bookings
              </Link>

              {isHoldExpired ? (
                <Link
                  href={villaSlug ? `/villas/${villaSlug}` : "/villas"}
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-sm min-h-[42px] flex items-center justify-center"
                >
                  Select Dates Again
                </Link>
              ) : (
                <Link
                  href="/villas"
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-sm min-h-[42px] flex items-center justify-center"
                >
                  Explore Other Villas
                </Link>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
