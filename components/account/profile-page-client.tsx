"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { DarangaLogo } from "@/components/brand/daranga-logo";
import { Footer } from "@/components/layout/footer";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";
import {
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
  LogOut,
  ArrowRight,
} from "lucide-react";

export function ProfilePageClient() {
  const router = useRouter();
  const { customer, firebaseUser, loading, logout, updateProfile } = useCustomerAuth();

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!editName.trim()) {
      setProfileError("Full legal name is required.");
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile(editName.trim(), editPhone.trim());
      setProfileSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile credentials.";
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
            Loading Your Profile...
          </span>
        </div>
      </div>
    );
  }

  const displayName = customer?.name || firebaseUser?.displayName || "Guest";
  const displayEmail = customer?.email || firebaseUser?.email || "No email on record";
  const displayPhone = customer?.phone || firebaseUser?.phoneNumber || "Not provided";
  const memberId = `#DV-${(customer?.id || firebaseUser?.uid || "8888").slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] flex flex-col justify-between">
      
      {/* Top Brand & Navigation Header */}
      <header className="w-full border-b border-[#DDD5C7]/70 dark:border-[#302D28] bg-white/70 dark:bg-[#151412]/70 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <DarangaLogo variant="horizontal" size="sm" asLink={true} />
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] transition-colors hidden sm:inline"
            >
              ← Home
            </Link>
            <Link
              href="/account/bookings"
              className="text-xs uppercase tracking-[0.18em] font-medium text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-[#F4EFE5] transition-colors"
            >
              My Bookings
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-20">
        
        {/* ================= 1. VIP RESIDENT HERO CARD ================= */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1C1A17] via-[#151412] to-[#0D0D0C] text-white p-5 sm:p-8 lg:p-10 border border-[#302D28] shadow-xl overflow-hidden mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C89B4A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* User Identity */}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-2 lg:pt-0">
              <a
                href="https://wa.me/919876543210?text=Hello%20Daranga%20Villa%20Concierge,%20I%20would%20like%20assistance%20with%20my%20stay."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 sm:px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 text-center"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#C89B4A] flex-shrink-0" />
                <span className="truncate">Concierge</span>
              </a>

              <Link
                href="/account/bookings"
                className="px-3 sm:px-4 py-2.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-md text-center truncate flex items-center justify-center"
              >
                My Bookings
              </Link>

              <button
                onClick={() => logout()}
                className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2.5 rounded-xl border border-white/15 hover:border-red-500/50 hover:text-red-400 text-stone-300 text-[11px] sm:text-xs font-medium uppercase tracking-wider transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= 2. PERSONAL CREDENTIALS & LIVE EDITOR ================= */}
        <div className="space-y-6">
          
          <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-medium text-[#171513] dark:text-[#F4EFE5] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C89B4A]" />
                  <span>Personal Details</span>
                </h2>
                <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] mt-0.5 font-light">
                  Your registered contact credentials used for reservation vouchers and stay coordination.
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
                  className="px-3.5 py-1.5 rounded-lg border border-[#DDD5C7] dark:border-[#302D28] hover:border-[#C89B4A] text-xs font-semibold text-[#6E685F] dark:text-[#A9A39A] hover:text-[#C89B4A] transition-colors flex items-center gap-1.5 flex-shrink-0"
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C89B4A]" />
                    Full Name
                  </span>
                  <span className="font-serif text-base font-medium text-[#171513] dark:text-[#F4EFE5] block truncate">
                    {displayName}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#C89B4A]" />
                    Email Address
                  </span>
                  <span className="font-mono text-sm text-[#171513] dark:text-[#F4EFE5] block break-all">
                    {displayEmail}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C89B4A]" />
                    Contact Phone
                  </span>
                  <span className="font-mono text-sm text-[#171513] dark:text-[#F4EFE5] block">
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

          {/* ================= 3. SECURITY & LOGIN METHODS ================= */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-6">
            <div className="pb-4 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60">
              <h2 className="font-serif text-lg sm:text-xl font-medium text-[#171513] dark:text-[#F4EFE5] flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#C89B4A]" />
                <span>Security &amp; Login Methods</span>
              </h2>
              <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] mt-0.5 font-light">
                Manage how you authenticate and secure your private sanctuary account.
              </p>
            </div>

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

            <div className="space-y-3.5 text-xs">
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

          {/* ================= 4. SANCTUARY PRIVILEGES ================= */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD5C7]/60 dark:border-[#302D28]/60">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-medium text-[#171513] dark:text-[#F4EFE5] flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#C89B4A]" />
                  <span>Resident Privileges</span>
                </h2>
                <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] font-light mt-0.5">
                  Exclusive amenities and personalized services included with your residency.
                </p>
              </div>

              <a
                href="https://wa.me/919876543210?text=Hello%20Concierge,%20I%20have%20a%20special%20request%20for%20my%20stay."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
              >
                <span>Contact Butler</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "24/7 Butler Desk",
                  desc: "Direct access to dedicated estate butlers for custom excursions, tea tastings, and evening bonfire coordination.",
                  icon: Crown,
                },
                {
                  title: "Private In-Villa Dining",
                  desc: "Bespoke culinary menus prepared on demand by private estate chefs featuring organic local ingredients.",
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
                    className="p-4 sm:p-5 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/50 dark:border-[#302D28]/50 space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#C89B4A]/10 border border-[#C89B4A]/30 flex items-center justify-center text-[#C89B4A]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-sm sm:text-base font-medium text-[#171513] dark:text-[#F4EFE5]">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A] font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
