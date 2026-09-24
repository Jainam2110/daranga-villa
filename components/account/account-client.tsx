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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C89B4A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#6E685F] dark:text-[#A9A39A]">
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
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="w-full border-b border-[#DDD5C7]/70 dark:border-[#302D28] bg-white/70 dark:bg-[#151412]/70 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <DarangaLogo variant="horizontal" size="sm" asLink={true} />
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] transition-colors hidden sm:inline"
            >
              ← Home
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-20">
        
        {/* ================= 1. VIP RESIDENT HERO CARD ================= */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1C1A17] via-[#151412] to-[#0D0D0C] text-white p-5 sm:p-8 lg:p-10 border border-[#302D28] shadow-2xl overflow-hidden mb-6 sm:mb-10">
          {/* Subtle Background Gold Glow */}
          <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#C89B4A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
            {/* Left: User Identity */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#C89B4A]/30 via-[#C89B4A]/10 to-transparent border border-[#C89B4A]/40 flex items-center justify-center text-[#C89B4A] font-serif text-2xl sm:text-3xl font-medium shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C89B4A] text-[#0B0B0A] flex items-center justify-center shadow-md">
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C89B4A]/20 border border-[#C89B4A]/40 text-[#C89B4A] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">
                    Sanctuary Resident
                  </span>
                  <span className="text-stone-400 font-mono text-[11px] sm:text-xs">
                    {memberId}
                  </span>
                </div>

                <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-normal text-white truncate">
                  {getGreeting()}, {displayName}
                </h1>

                <div className="text-xs sm:text-sm text-stone-300 font-light flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 break-all">
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
                <MessageCircle className="w-3.5 h-3.5 text-[#C89B4A] flex-shrink-0" />
                <span className="truncate">Concierge</span>
              </a>

              <Link
                href="/villas"
                className="px-3 sm:px-5 py-2.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-md text-center truncate flex items-center justify-center"
              >
                Explore Villas
              </Link>

              <button
                onClick={() => logout()}
                className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2.5 rounded-xl border border-white/15 hover:border-red-500/50 hover:text-red-400 text-stone-300 text-[11px] sm:text-xs font-medium uppercase tracking-[0.14em] transition-colors text-center"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 text-xs">
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block">Upcoming Stays</span>
              <span className="font-serif text-lg sm:text-2xl text-[#C89B4A] font-semibold mt-0.5 block">
                {upcomingBookings.length}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block">Past Visits</span>
              <span className="font-serif text-lg sm:text-2xl text-white font-semibold mt-0.5 block">
                {pastBookings.length}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block">Nights Hosted</span>
              <span className="font-serif text-lg sm:text-2xl text-[#C89B4A] font-semibold mt-0.5 block">
                {totalNightsHosted}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block">Sanctuary Tier</span>
              <span className="font-serif text-sm sm:text-lg text-emerald-400 font-semibold mt-1 block truncate">
                Verified Resident
              </span>
            </div>
          </div>
        </div>

        {/* ================= 2. MAIN SECTION TABS (Smooth Touch Scroll) ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none border-b border-[#DDD5C7] dark:border-[#302D28] -mx-3 px-3 sm:mx-0 sm:px-0">
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
                className={`px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-1.5 sm:gap-2 transition-all flex-shrink-0 whitespace-nowrap min-h-[42px] ${
                  isActive
                    ? "bg-[#C89B4A] text-[#0B0B0A] shadow-sm"
                    : "bg-white dark:bg-[#151412] text-[#6E685F] dark:text-[#A9A39A] border border-[#DDD5C7] dark:border-[#302D28] hover:text-[#171513] dark:hover:text-[#F4EFE5]"
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
            <div className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm">
              
              {/* Header & Sub-filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60 mb-6">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-light text-[#171513] dark:text-[#F4EFE5]">
                    Your Stay Reservations
                  </h2>
                  <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] mt-1 font-light">
                    Track confirmed itineraries, pending reservation holds, and past retreat visits.
                  </p>
                </div>

                {/* Sub-Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#F5F2EC] dark:bg-[#1C1A17] p-1 rounded-xl border border-[#DDD5C7] dark:border-[#302D28] overflow-x-auto scrollbar-none">
                  {(["ALL", "UPCOMING", "PAST", "CANCELLED"] as StayFilterTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStayFilter(tab)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                        stayFilter === tab
                          ? "bg-white dark:bg-[#151412] text-[#A8792E] dark:text-[#C89B4A] shadow-xs"
                          : "text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {loadingBookings ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#C89B4A] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">Retrieving your stay reservations...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-12 sm:py-16 px-4 text-center border-2 border-dashed border-[#DDD5C7] dark:border-[#302D28] rounded-2xl space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F5F2EC] dark:bg-[#1C1A17] flex items-center justify-center mx-auto text-[#A8792E] dark:text-[#C89B4A]">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-light text-[#171513] dark:text-[#F4EFE5]">
                      No {stayFilter.toLowerCase()} reservations registered
                    </h3>
                    <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] mt-1 max-w-sm mx-auto font-light leading-relaxed">
                      {stayFilter === "ALL"
                        ? "Begin your journey at Daranga Villa by exploring our private ocean and desert sanctuary residences."
                        : `You currently have no ${stayFilter.toLowerCase()} reservations.`}
                    </p>
                  </div>
                  <Link
                    href="/villas"
                    className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-[0.16em] font-bold transition-all shadow-md"
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
                        className="p-4 sm:p-6 rounded-2xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7] dark:border-[#302D28] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5 transition-all hover:border-[#C89B4A] hover:shadow-lg group block"
                      >
                        <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0 flex-1 w-full sm:w-auto">
                          {/* Thumbnail */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#1c1917] flex-shrink-0">
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
                              <span className="font-serif text-base sm:text-xl font-medium text-[#171513] dark:text-[#F4EFE5] group-hover:text-[#A8792E] dark:group-hover:text-[#C89B4A] transition-colors truncate">
                                {villaName}
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase border ${
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
                                  ? "CONFIRMED"
                                  : isCancelled
                                  ? "CANCELLED"
                                  : isHoldExpired
                                  ? "EXPIRED"
                                  : "PENDING"}
                              </span>
                            </div>

                            <div className="text-[11px] sm:text-xs text-[#6E685F] dark:text-[#A9A39A] flex flex-wrap items-center gap-x-3 gap-y-1 font-light">
                              <span className="font-mono font-bold text-[#A8792E] dark:text-[#C89B4A]">
                                {bookingRef}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#A8792E] dark:text-[#C89B4A]" />
                                <span>{checkInDate} &rarr; {checkOutDate} ({nights}n)</span>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#A8792E] dark:text-[#C89B4A]" />
                                <span>{booking.guests} Guests</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Total & Arrow */}
                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#DDD5C7] dark:border-[#302D28]">
                          <div className="text-left md:text-right">
                            <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                              Total Stay Price
                            </span>
                            <span className="font-serif text-lg sm:text-xl font-bold text-[#A8792E] dark:text-[#C89B4A]">
                              ₹{booking.totalAmount?.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] group-hover:border-[#C89B4A] flex items-center justify-center text-[#6E685F] dark:text-[#A9A39A] group-hover:text-[#C89B4A] transition-colors flex-shrink-0">
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
              <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-6">
                
                <div className="flex items-center justify-between pb-5 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal text-[#171513] dark:text-[#F4EFE5]">
                      Personal Credentials
                    </h3>
                    <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] mt-0.5 font-light">
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
                      className="px-3 py-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#302D28] hover:border-[#C89B4A] text-xs font-semibold text-[#6E685F] dark:text-[#A9A39A] hover:text-[#C89B4A] transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Feedback Alerts */}
                {profileSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Your profile credentials have been updated successfully.</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {!isEditingProfile ? (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C89B4A]" />
                        Full Legal Name
                      </span>
                      <span className="font-serif text-base font-medium text-[#171513] dark:text-[#F4EFE5]">
                        {displayName}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#C89B4A]" />
                        Authoritative Email Address
                      </span>
                      <span className="font-mono text-sm text-[#171513] dark:text-[#F4EFE5] break-all">
                        {displayEmail}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C89B4A]" />
                        Contact Phone
                      </span>
                      <span className="font-mono text-sm text-[#171513] dark:text-[#F4EFE5]">
                        {displayPhone}
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1.5">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-[#171513] dark:text-[#F4EFE5] text-base sm:text-sm focus:outline-none focus:border-[#C89B4A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1.5">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-[#171513] dark:text-[#F4EFE5] text-base sm:text-sm focus:outline-none focus:border-[#C89B4A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1.5">
                        Email Address (Managed via Auth Provider)
                      </label>
                      <input
                        type="email"
                        value={displayEmail}
                        disabled
                        className="w-full px-4 py-3 rounded-xl bg-[#EAE6DF] dark:bg-[#141311] border border-[#DDD5C7] dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] text-base sm:text-sm cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="py-3 px-6 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] disabled:opacity-50 text-[#0B0B0A] text-xs font-bold uppercase tracking-wider transition-all min-h-[44px]"
                      >
                        {profileSaving ? "Saving..." : "Save Details"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileError(null);
                        }}
                        className="py-3 px-4 rounded-xl border border-[#DDD5C7] dark:border-[#302D28] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17] text-[#6E685F] dark:text-[#A9A39A] text-xs transition-colors min-h-[44px]"
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
              <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60">
                  <Crown className="w-4 h-4 text-[#C89B4A]" />
                  <h4 className="font-serif text-lg font-medium text-[#171513] dark:text-[#F4EFE5]">
                    Resident Membership
                  </h4>
                </div>

                <div className="space-y-3 font-light text-[#6E685F] dark:text-[#A9A39A] leading-relaxed">
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
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                  >
                    <span>Contact Assigned Butler</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. TAB 3: SECURITY & SIGN-IN METHODS ================= */}
        {activeMainTab === "SECURITY" && (
          <div className="max-w-3xl space-y-6">
            <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-6">
              <div className="pb-4 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60">
                <h3 className="font-serif text-lg sm:text-xl font-normal text-[#171513] dark:text-[#F4EFE5] flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#C89B4A]" />
                  <span>Security &amp; Login Methods</span>
                </h3>
                <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] mt-1 font-light">
                  Manage how you authenticate and protect your private sanctuary account.
                </p>
              </div>

              {/* Password Reset Feedback */}
              {passwordResetSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordResetSuccess}</span>
                </div>
              )}

              {passwordResetError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordResetError}</span>
                </div>
              )}

              {/* Active Providers */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <KeyRound className="w-4 h-4 text-[#C89B4A] flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block font-medium text-[#171513] dark:text-[#F4EFE5] truncate">
                        Connected Sign-In Methods
                      </span>
                      <span className="text-[#6E685F] dark:text-[#A9A39A] text-[11px] truncate block">
                        {(customer?.authProviders || ["password"]).join(", ")}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase flex-shrink-0">
                    Active
                  </span>
                </div>

                {/* Password Reset Action */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="block font-medium text-[#171513] dark:text-[#F4EFE5] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#C89B4A]" />
                      Account Password
                    </span>
                    <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A] font-light leading-relaxed">
                      Send a secure password reset link to your registered email address ({displayEmail}).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={passwordResetSending}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all flex-shrink-0 text-center min-h-[42px]"
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
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#C89B4A]/10 border border-[#C89B4A]/30 flex items-center justify-center text-[#C89B4A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-medium text-[#171513] dark:text-[#F4EFE5]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] font-light leading-relaxed">
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


