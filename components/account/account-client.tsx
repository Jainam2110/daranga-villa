"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { DarangaLogo } from "@/components/brand/daranga-logo";
import { Footer } from "@/components/layout/footer";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";
import {
  Calendar,
  ChevronRight,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Shield,
  Crown,
  Sparkles,
  KeyRound,
  Compass,
  MessageCircle,
  Lock,
  ArrowRight,
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

type MainSectionTab = "STAYS" | "PROFILE" | "SECURITY" | "PRIVILEGES";
type StayFilterTab = "ALL" | "UPCOMING" | "PAST" | "CANCELLED";

export function AccountClient() {
  const router = useRouter();
  const { customer, firebaseUser, idToken, loading, logout, updateProfile } = useCustomerAuth();

  const [activeMainTab, setActiveMainTab] = useState<MainSectionTab>("STAYS");
  const [stayFilter, setStayFilter] = useState<StayFilterTab>("ALL");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);
  const [nowMs] = useState<number>(() => Date.now());

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<boolean>(false);

  // Security / Password Reset State
  const [passwordResetSending, setPasswordResetSending] = useState<boolean>(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState<string | null>(null);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login?redirect=/account");
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!editName.trim()) {
      setProfileError("Full name is required.");
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile(editName.trim(), editPhone.trim());
      setProfileSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setProfileError(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    const targetEmail = customer?.email || firebaseUser?.email;
    if (!targetEmail) {
      setPasswordResetError("No email address found for this account.");
      return;
    }

    setPasswordResetSending(true);
    setPasswordResetError(null);
    setPasswordResetSuccess(null);

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setPasswordResetSuccess(`Password reset email sent to ${targetEmail}. Please check your inbox.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send password reset email.";
      setPasswordResetError(msg);
    } finally {
      setPasswordResetSending(false);
    }
  };

  if (loading || (!customer && !firebaseUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8] dark:bg-[#171717]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#202020] dark:border-[#B99A62] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#66635F] dark:text-[#BDB8B0]">
            Loading Your Sanctuary...
          </span>
        </div>
      </div>
    );
  }

  const displayName = customer?.name || firebaseUser?.displayName || "Guest";
  const displayEmail = customer?.email || firebaseUser?.email || "No email on record";
  const displayPhone = customer?.phone || firebaseUser?.phoneNumber || "Not provided";
  const memberId = `#DV-${(customer?.id || firebaseUser?.uid || "8888").slice(-6).toUpperCase()}`;

  // Filter Bookings & Summary Metrics
  const todayStr = new Date().toISOString().split("T")[0];

  const upcomingBookings = bookings.filter(
    (b) => b.status !== "CANCELLED" && b.checkOut.split("T")[0] >= todayStr
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== "CANCELLED" && b.checkOut.split("T")[0] < todayStr
  );

  // Calculate total nights stayed
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
      {/* Top Header Bar */}
      <header className="w-full border-b border-[#E8E6E2] dark:border-[#383633] bg-white/90 dark:bg-[#202020]/90 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <DarangaLogo variant="horizontal" size="sm" asLink={true} />
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors hidden sm:inline"
            >
              ← Home
            </Link>
            <Link
              href="/villas"
              className="px-4 py-2 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-[11px] font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              Explore Villas
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-20">
        
        {/* ================= 1. VIP RESIDENT HERO CARD ================= */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#202020] text-white p-5 sm:p-8 lg:p-10 border border-[#383633] shadow-2xl overflow-hidden mb-6 sm:mb-10">
          {/* Subtle Background Gold Glow */}
          <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#B99A62]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
            {/* Left: User Identity */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[#B99A62]/15 border border-[#B99A62]/30 flex items-center justify-center text-[#B99A62] font-serif text-2xl sm:text-3xl font-medium shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#B99A62] text-[#202020] flex items-center justify-center shadow-md">
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B99A62]/20 border border-[#B99A62]/40 text-[#B99A62] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">
                    Sanctuary Resident
                  </span>
                  <span className="text-[#DAD7D1] font-mono text-[11px] sm:text-xs">
                    {memberId}
                  </span>
                </div>

                <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-normal text-white truncate">
                  {getGreeting()}, {displayName}
                </h1>

                <div className="text-xs sm:text-sm text-[#DAD7D1] font-light flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 break-all">
                  <span className="truncate">{displayEmail}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{displayPhone}</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-2 lg:pt-0">
              <a
                href="https://wa.me/919876543210?text=Hello%20Daranga%20Villa%20Concierge,%20I%20would%20like%20assistance%20with%20my%20stay."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 sm:px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#B99A62] flex-shrink-0" />
                <span className="truncate">Concierge</span>
              </a>

              <Link
                href="/villas"
                className="px-3 sm:px-5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F7F6F3] text-[#202020] text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-md text-center truncate flex items-center justify-center"
              >
                Explore Villas
              </Link>

              <button
                onClick={() => logout()}
                className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2.5 rounded-xl border border-white/15 hover:border-[#B84A4A] hover:text-[#B84A4A] text-[#DAD7D1] text-[11px] sm:text-xs font-medium uppercase tracking-[0.14em] transition-colors text-center"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 text-xs">
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-[#DAD7D1] uppercase tracking-wider block">Upcoming Stays</span>
              <span className="font-serif text-lg sm:text-2xl text-[#B99A62] font-semibold mt-0.5 block">
                {upcomingBookings.length}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-[#DAD7D1] uppercase tracking-wider block">Past Visits</span>
              <span className="font-serif text-lg sm:text-2xl text-white font-semibold mt-0.5 block">
                {pastBookings.length}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-[#DAD7D1] uppercase tracking-wider block">Nights Hosted</span>
              <span className="font-serif text-lg sm:text-2xl text-[#B99A62] font-semibold mt-0.5 block">
                {totalNightsHosted}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-[#DAD7D1] uppercase tracking-wider block">Sanctuary Tier</span>
              <span className="font-serif text-sm sm:text-lg text-[#3F6B52] font-semibold mt-1 block truncate">
                Verified Resident
              </span>
            </div>
          </div>
        </div>

        {/* ================= 2. MAIN SECTION TABS ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none border-b border-[#E8E6E2] dark:border-[#383633] -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { id: "STAYS", label: "My Stays & Bookings", icon: Calendar },
            { id: "PROFILE", label: "Resident Details", icon: User },
            { id: "SECURITY", label: "Security & Login", icon: Shield },
            { id: "PRIVILEGES", label: "Sanctuary Privileges", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as MainSectionTab)}
                className={`px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1.5 sm:gap-2 transition-all flex-shrink-0 whitespace-nowrap min-h-[42px] ${
                  isActive
                    ? "bg-[#202020] text-[#FFFFFF] shadow-sm dark:bg-[#FFFFFF] dark:text-[#202020]"
                    : "bg-white dark:bg-[#202020] text-[#66635F] dark:text-[#BDB8B0] border border-[#E8E6E2] dark:border-[#383633] hover:text-[#202020] dark:hover:text-[#FCFBF8]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= 3. TAB 1: STAYS & RESERVATIONS ================= */}
        {activeMainTab === "STAYS" && (
          <div className="space-y-6">
            <div className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-sm">
              
              {/* Header & Sub-filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#E8E6E2] dark:border-[#383633] mb-6">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-light text-[#202020] dark:text-[#FCFBF8]">
                    Your Stay Reservations
                  </h2>
                  <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] mt-1 font-light">
                    Track confirmed itineraries, pending reservation holds, and past retreat visits.
                  </p>
                </div>

                {/* Sub-Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#F7F6F3] dark:bg-[#171717] p-1 rounded-xl border border-[#E8E6E2] dark:border-[#383633] overflow-x-auto scrollbar-none">
                  {(["ALL", "UPCOMING", "PAST", "CANCELLED"] as StayFilterTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStayFilter(tab)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
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

              {loadingBookings ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#202020] dark:border-[#B99A62] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">Retrieving your stay reservations...</p>
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
                        : `You currently have no ${stayFilter.toLowerCase()} reservations.`}
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
                        className="p-4 sm:p-6 rounded-2xl bg-[#FCFBF8] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5 transition-all hover:border-[#202020] dark:hover:border-[#B99A62] hover:shadow-md group block"
                      >
                        <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0 flex-1 w-full sm:w-auto">
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

                          <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif text-base sm:text-xl font-medium text-[#202020] dark:text-[#FCFBF8] group-hover:text-[#B99A62] transition-colors truncate">
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
                              Total Stay Price
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
          </div>
        )}

        {/* ================= 4. TAB 2: RESIDENT DETAILS & EDIT ================= */}
        {activeMainTab === "PROFILE" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-sm space-y-6">
                
                <div className="flex items-center justify-between pb-5 border-b border-[#E8E6E2] dark:border-[#383633]">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal text-[#202020] dark:text-[#FCFBF8]">
                      Personal Credentials
                    </h3>
                    <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] mt-0.5 font-light">
                      Manage your contact details used for reservation vouchers and stay coordination.
                    </p>
                  </div>

                  {!isEditingProfile && (
                    <button
                      onClick={() => {
                        setEditName(customer?.name || firebaseUser?.displayName || "");
                        setEditPhone(customer?.phone || firebaseUser?.phoneNumber || "");
                        setIsEditingProfile(true);
                        setProfileError(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#DAD7D1] dark:border-[#383633] hover:border-[#202020] dark:hover:border-[#B99A62] text-xs font-semibold text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Feedback Alerts */}
                {profileSuccess && (
                  <div className="p-3.5 rounded-xl bg-[#3F6B52]/10 border border-[#3F6B52]/30 text-[#3F6B52] text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Your profile credentials have been updated successfully.</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3.5 rounded-xl bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-[#B84A4A] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {!isEditingProfile ? (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-4 rounded-xl bg-[#FCFBF8] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633]">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#B99A62]" />
                        Full Legal Name
                      </span>
                      <span className="font-serif text-base font-medium text-[#202020] dark:text-[#FCFBF8]">
                        {displayName}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FCFBF8] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633]">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#B99A62]" />
                        Authoritative Email Address
                      </span>
                      <span className="font-mono text-sm text-[#202020] dark:text-[#FCFBF8] break-all">
                        {displayEmail}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FCFBF8] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633]">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#B99A62]" />
                        Contact Phone
                      </span>
                      <span className="font-mono text-sm text-[#202020] dark:text-[#FCFBF8]">
                        {displayPhone}
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1.5">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-[#202020] dark:text-[#FCFBF8] text-base sm:text-sm focus:outline-none focus:border-[#B99A62] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1.5">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-[#202020] dark:text-[#FCFBF8] text-base sm:text-sm focus:outline-none focus:border-[#B99A62] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1.5">
                        Email Address (Managed via Auth Provider)
                      </label>
                      <input
                        type="email"
                        value={displayEmail}
                        disabled
                        className="w-full px-4 py-3 rounded-xl bg-[#F7F6F3] dark:bg-[#171717]/60 border border-[#E8E6E2] dark:border-[#383633] text-[#8A8782] dark:text-[#66635F] text-base sm:text-sm cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="py-3 px-6 rounded-xl bg-[#202020] hover:bg-[#171717] disabled:opacity-50 text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px]"
                      >
                        {profileSaving ? "Saving..." : "Save Details"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileError(null);
                        }}
                        className="py-3 px-4 rounded-xl border border-[#DAD7D1] dark:border-[#383633] hover:bg-[#F7F6F3] dark:hover:bg-[#171717] text-[#66635F] dark:text-[#BDB8B0] text-xs transition-colors min-h-[44px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Resident Sanctuary Card & Notes */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E8E6E2] dark:border-[#383633]">
                  <Crown className="w-4 h-4 text-[#B99A62]" />
                  <h4 className="font-serif text-lg font-medium text-[#202020] dark:text-[#FCFBF8]">
                    Resident Membership
                  </h4>
                </div>

                <div className="space-y-3 font-light text-[#66635F] dark:text-[#BDB8B0] leading-relaxed">
                  <p>
                    As a recognized Daranga Villa resident, your account enjoys priority reservation hold windows, personalized check-in coordination, and direct butler desk access.
                  </p>
                  <p>
                    For bespoke stay arrangements or custom dietary preparation, feel free to coordinate with your assigned butler via the Concierge desk.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href="https://wa.me/919876543210?text=Hello%20Concierge,%20I%20have%20a%20special%20request%20for%20my%20stay."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] hover:text-[#B99A62] transition-colors"
                  >
                    <span>Contact Assigned Butler</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B99A62]" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. TAB 3: SECURITY & SIGN-IN METHODS ================= */}
        {activeMainTab === "SECURITY" && (
          <div className="max-w-3xl space-y-6">
            <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-sm space-y-6">
              <div className="pb-4 border-b border-[#E8E6E2] dark:border-[#383633]">
                <h3 className="font-serif text-lg sm:text-xl font-normal text-[#202020] dark:text-[#FCFBF8] flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#B99A62]" />
                  <span>Security &amp; Login Methods</span>
                </h3>
                <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] mt-1 font-light">
                  Manage how you authenticate and protect your private sanctuary account.
                </p>
              </div>

              {/* Password Reset Feedback */}
              {passwordResetSuccess && (
                <div className="p-3.5 rounded-xl bg-[#3F6B52]/10 border border-[#3F6B52]/30 text-[#3F6B52] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordResetSuccess}</span>
                </div>
              )}

              {passwordResetError && (
                <div className="p-3.5 rounded-xl bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-[#B84A4A] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordResetError}</span>
                </div>
              )}

              {/* Active Providers */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FCFBF8] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <KeyRound className="w-4 h-4 text-[#B99A62] flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block font-medium text-[#202020] dark:text-[#FCFBF8] truncate">
                        Connected Sign-In Methods
                      </span>
                      <span className="text-[#66635F] dark:text-[#BDB8B0] text-[11px] truncate block">
                        {(customer?.authProviders || ["password"]).join(", ")}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3F6B52]/10 border border-[#3F6B52]/30 text-[#3F6B52] text-[10px] font-semibold uppercase flex-shrink-0">
                    Active
                  </span>
                </div>

                {/* Password Reset Action */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#FCFBF8] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="block font-medium text-[#202020] dark:text-[#FCFBF8] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#B99A62]" />
                      Account Password
                    </span>
                    <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0] font-light leading-relaxed">
                      Send a secure password reset link to your registered email address ({displayEmail}).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={passwordResetSending}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-all flex-shrink-0 text-center min-h-[42px]"
                  >
                    {passwordResetSending ? "Sending..." : "Reset Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. TAB 4: SANCTUARY PRIVILEGES ================= */}
        {activeMainTab === "PRIVILEGES" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "24/7 Butler & Concierge",
                desc: "Direct access to dedicated villa butlers for custom excursions, tea tastings, and evening bonfire coordination.",
                icon: Crown,
              },
              {
                title: "Private In-Villa Dining",
                desc: "Bespoke culinary menus prepared on demand by private estate chefs featuring local organic ingredients.",
                icon: Sparkles,
              },
              {
                title: "Secluded Sanctuary Grounds",
                desc: "Guaranteed architectural exclusivity, private infinity pool access, and tranquil desert vistas.",
                icon: Compass,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-sm space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5D0B5]/20 border border-[#F5D0B5]/50 flex items-center justify-center text-[#202020] dark:text-[#FCFBF8]">
                    <Icon className="w-5 h-5 text-[#B99A62]" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-medium text-[#202020] dark:text-[#FCFBF8]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
