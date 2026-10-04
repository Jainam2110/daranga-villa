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

import { getVillaAddress } from "@/lib/utils/villa-location";

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
    location?: unknown;
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
      if (!bookingId) return;
      if (authLoading) return;

      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let activeToken = idToken;
        if (!activeToken && firebaseUser) {
          activeToken = await firebaseUser.getIdToken();
        }

        if (!activeToken) {
          setError("Authentication token required to view booking details.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/customer/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${activeToken}`,
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

    if (!authLoading) {
      fetchBookingDetails();
    }
  }, [authLoading, firebaseUser, idToken, bookingId]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9] dark:bg-[#171717]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#202020] dark:border-[#EFA1AA] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#555555] dark:text-[#BDBDBD]">
            Verifying Reservation Details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#FCFBF9] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] flex flex-col justify-between">
        {/* Top Header Bar */}
        <header className="w-full border-b border-[#E8E8E8] dark:border-[#383838] bg-white/90 dark:bg-[#202020]/90 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <DarangaLogo variant="horizontal" size="sm" asLink={true} />
            <Link
              href="/account/bookings"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#555555] dark:text-[#BDBDBD] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors"
            >
              ← My Bookings
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16">
          <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/20 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C94A4A]">
                Access Error
              </span>
              <h1 className="font-serif text-3xl font-light text-[#202020] dark:text-[#FCFBF8]">
                Booking Not Available
              </h1>
              <p className="text-xs sm:text-sm text-[#555555] dark:text-[#BDBDBD] max-w-md mx-auto font-light">
                {error || "The requested booking reservation could not be found or does not belong to your account."}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/account/bookings"
                className="px-6 py-3 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-xs font-semibold uppercase tracking-[0.18em] transition-all shadow-sm inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to My Bookings</span>
              </Link>
              <Link
                href="/villas"
                className="px-6 py-3 rounded-xl border border-[#DCDCDC] dark:border-[#383838] text-xs font-semibold uppercase tracking-[0.18em] text-[#202020] dark:text-[#FCFBF8] hover:border-[#202020] dark:hover:border-[#EFA1AA] transition-colors"
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

  const villaLocation = getVillaAddress(
    booking.villa?.location,
    booking.villa?.address || booking.villa?.city || "Udaipur, Rajasthan"
  );
  const pricePerNight = booking.villa?.pricePerNight || Math.round(booking.totalAmount / nights);
  const bookingReference = `#${(booking.id || booking._id || "").slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="w-full border-b border-[#E8E6E2] dark:border-[#383633] bg-white/90 dark:bg-[#202020]/90 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <DarangaLogo variant="horizontal" size="sm" asLink={true} />
          
          <div className="flex items-center gap-3">
            <Link
              href="/account/bookings"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors"
            >
              ← My Bookings
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/account/bookings"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </Link>
        </div>

        {/* Main Status Header Card */}
        <div className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-sm mb-6 sm:mb-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#E8E8E8] dark:border-[#383838]">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border flex-shrink-0 ${
                  isPaidAndConfirmed
                    ? "bg-[#3F7658]/10 text-[#3F7658] border-[#3F7658]/30"
                    : isCancelled
                    ? "bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30"
                    : isHoldExpired
                    ? "bg-[#999999]/10 text-[#777777] border-[#DCDCDC]"
                    : "bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/30"
                }`}
              >
                {isPaidAndConfirmed ? (
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#3F7658]" />
                ) : isCancelled || isHoldExpired ? (
                  <XCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                ) : (
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[#D9822B]" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9px] sm:text-[10px] font-semibold tracking-[0.18em] px-2.5 py-0.5 rounded-full border ${
                      isPaidAndConfirmed
                        ? "bg-[#3F7658]/10 text-[#3F7658] border-[#3F7658]/30"
                        : isCancelled
                        ? "bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/30"
                        : isHoldExpired
                        ? "bg-[#999999]/10 text-[#777777] border-[#DCDCDC]"
                        : "bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/30"
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

                <h1 className="font-serif text-xl sm:text-3xl font-light text-[#202020] dark:text-[#FCFBF8] mt-1 truncate">
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

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto border-[#E8E8E8] dark:border-[#383838]">
              <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#555555] dark:text-[#999999]">
                Booking Reference
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#202020] dark:text-[#FCFBF8]">
                {bookingReference}
              </span>
            </div>
          </div>

          {/* Subtext description & Hold Timer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-[#555555] dark:text-[#BDBDBD] font-light max-w-xl leading-relaxed">
              {isPaidAndConfirmed
                ? "Payment has been verified and your stay reservation is fully confirmed. We look forward to hosting you at Daranga Villa."
                : isCancelled
                ? "This booking request was cancelled."
                : isHoldExpired
                ? "Your temporary hold on these dates has expired. Please choose your stay dates again to start a new booking."
                : "Your reservation request is saved. Complete your payment before the hold timer expires to lock in your dates."}
            </p>

            {!isPaidAndConfirmed && !isCancelled && !isHoldExpired && booking.paymentHoldExpiresAt && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FBE9DC] border border-[#F6D2B8] rounded-xl text-xs font-semibold text-[#202020] flex-shrink-0">
                <Clock className="w-4 h-4 text-[#D9822B] animate-pulse" />
                <span>Hold expires in {formattedTimer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* LEFT COLUMN: Villa Visual & Specs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] overflow-hidden shadow-sm">
              <div className="relative h-48 sm:h-64 w-full bg-[#202020]">
                <Image
                  src={villaImage}
                  alt={villaName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-[#EFA1AA] block mb-0.5">
                    Private Villa Residence
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-normal text-white truncate">
                    {villaName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/80 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EFA1AA]" />
                    <span>{villaLocation}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#FCFBF9] dark:bg-[#171717] rounded-xl border border-[#E8E8E8] dark:border-[#383838]">
                  <div>
                    <span className="block text-[9px] sm:text-[10px] text-[#555555] dark:text-[#999999] uppercase font-semibold">Guests</span>
                    <span className="font-medium text-[#202020] dark:text-[#FCFBF8] flex items-center justify-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                      <Users className="w-3.5 h-3.5 text-[#202020] dark:text-[#FCFBF8]" />
                      {booking.guests} Max
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] sm:text-[10px] text-[#555555] dark:text-[#999999] uppercase font-semibold">Bedrooms</span>
                    <span className="font-medium text-[#202020] dark:text-[#FCFBF8] flex items-center justify-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                      <Bed className="w-3.5 h-3.5 text-[#202020] dark:text-[#FCFBF8]" />
                      {booking.villa?.bedrooms || 2} Beds
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] sm:text-[10px] text-[#555555] dark:text-[#999999] uppercase font-semibold">Baths</span>
                    <span className="font-medium text-[#202020] dark:text-[#FCFBF8] flex items-center justify-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                      <Bath className="w-3.5 h-3.5 text-[#202020] dark:text-[#FCFBF8]" />
                      {booking.villa?.bathrooms || 2} Baths
                    </span>
                  </div>
                </div>

                {villaSlug && (
                  <Link
                    href={`/villas/${villaSlug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] hover:text-[#EFA1AA] transition-colors pt-1"
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
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-sm space-y-4 sm:space-y-5">
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#202020] dark:text-[#FCFBF8] pb-3 border-b border-[#E8E8E8] dark:border-[#383838] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#202020] dark:text-[#EFA1AA]" />
                <span>Stay Schedule</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#FCFBF9] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#555555] dark:text-[#999999]">
                    Check-In Date
                  </span>
                  <div className="font-serif text-sm sm:text-base font-medium text-[#202020] dark:text-[#FCFBF8]">
                    {checkInFormatted}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#555555] dark:text-[#999999] block">
                    From 2:00 PM
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#FCFBF9] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383838] space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#555555] dark:text-[#999999]">
                    Check-Out Date
                  </span>
                  <div className="font-serif text-sm sm:text-base font-medium text-[#202020] dark:text-[#FCFBF8]">
                    {checkOutFormatted}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#555555] dark:text-[#999999] block">
                    Until 11:00 AM
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 sm:pt-2">
                <span className="text-[#555555] dark:text-[#999999]">Total Duration:</span>
                <span className="font-medium text-[#202020] dark:text-[#FCFBF8]">
                  {nights} Night{nights > 1 ? "s" : ""} • {booking.guests} Guests
                </span>
              </div>
            </div>

            {/* Guest Contact Info */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-sm space-y-4">
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#202020] dark:text-[#FCFBF8] pb-3 border-b border-[#E8E8E8] dark:border-[#383838] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#202020] dark:text-[#EFA1AA]" />
                <span>Primary Guest Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
                <div>
                  <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#555555] dark:text-[#999999] mb-0.5">
                    Guest Name
                  </span>
                  <span className="font-medium text-[#202020] dark:text-[#FCFBF8] block truncate">
                    {booking.guestName}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#555555] dark:text-[#999999] mb-0.5">
                    Email Address
                  </span>
                  <span className="font-medium text-[#202020] dark:text-[#FCFBF8] block break-all">
                    {booking.guestEmail}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#555555] dark:text-[#999999] mb-0.5">
                    Contact Phone
                  </span>
                  <span className="font-medium text-[#202020] dark:text-[#FCFBF8] block">
                    {booking.guestPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Authority & Payment Summary */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] shadow-sm space-y-4 text-xs">
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#202020] dark:text-[#FCFBF8] pb-3 border-b border-[#E8E8E8] dark:border-[#383838] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#202020] dark:text-[#EFA1AA]" />
                <span>Financial & Payment Details</span>
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[#555555] dark:text-[#999999]">
                  <span>Nightly Rate (₹{pricePerNight.toLocaleString("en-IN")} × {nights}n)</span>
                  <span className="font-medium text-[#202020] dark:text-[#FCFBF8]">
                    ₹{(pricePerNight * nights).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#555555] dark:text-[#999999]">
                  <span>Taxes & Service Privileges</span>
                  <span className="font-medium text-[#3F7658]">Included</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E8E8E8] dark:border-[#383838]">
                  <span className="font-serif text-sm sm:text-base font-medium text-[#202020] dark:text-[#FCFBF8]">
                    Total Reservation Price
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                    ₹{booking.totalAmount?.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E8E8E8] dark:border-[#383838] text-[11px]">
                  <span className="text-[#555555] dark:text-[#999999]">Payment Status</span>
                  <span
                    className={`px-3 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                      isPaidAndConfirmed
                        ? "bg-[#3F7658]/10 text-[#3F7658] border-[#3F7658]/30"
                        : isHoldExpired
                        ? "bg-[#999999]/10 text-[#777777] border-[#DCDCDC]"
                        : "bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/30"
                    }`}
                  >
                    {booking.paymentStatus}
                  </span>
                </div>

                {booking.razorpayPaymentId && (
                  <div className="flex justify-between items-center text-[10px] text-[#555555] dark:text-[#999999]">
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
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-[#DCDCDC] dark:border-[#383838] text-xs font-semibold uppercase tracking-[0.16em] text-[#202020] dark:text-[#FCFBF8] hover:border-[#202020] dark:hover:border-[#EFA1AA] transition-colors min-h-[42px] flex items-center justify-center cursor-pointer"
              >
                Back to My Bookings
              </Link>

              {isHoldExpired ? (
                <Link
                  href={villaSlug ? `/villas/${villaSlug}` : "/villas"}
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-sm min-h-[42px] flex items-center justify-center cursor-pointer"
                >
                  Select Dates Again
                </Link>
              ) : (
                <Link
                  href="/villas"
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-sm min-h-[42px] flex items-center justify-center cursor-pointer"
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
