"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";
import { getFriendlyAuthErrorMessage } from "@/lib/firebase/errors";
import { DarangaLogo } from "@/components/brand/daranga-logo";

export function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { customer, firebaseUser, syncProfile } = useCustomerAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (firebaseUser && customer) {
      router.push(redirectUrl);
    }
  }, [firebaseUser, customer, router, redirectUrl]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2. Set Firebase Auth displayName
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName.trim(),
        });
      }

      // 3. Sync customer profile with MongoDB (strictly role = CUSTOMER)
      const syncedUser = await syncProfile(fullName.trim(), phone.trim() || undefined);

      if (!syncedUser) {
        setErrorMessage("Your account was created, but we couldn't finish setting up your profile. Please try again.");
        return;
      }

      // 4. Redirect
      router.push(redirectUrl);
    } catch (err) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signInWithPopup(auth, googleProvider);
      const syncedUser = await syncProfile();

      if (!syncedUser) {
        setErrorMessage("Your account was created, but we couldn't finish setting up your profile. Please try again.");
        return;
      }

      router.push(redirectUrl);
    } catch (err) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F2EC] dark:bg-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] flex flex-col justify-between">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 my-auto">
        <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#282520] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT COLUMN: VISUAL (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-[#1c1917] p-8 flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 z-10" />
            <Image
              src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
              alt="Daranga Villa Modern Architecture"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 transition-transform duration-1000 hover:scale-105"
            />

            <div className="relative z-20">
              <DarangaLogo
                variant="horizontal"
                size="md"
                theme="gold"
                withTagline={true}
                asLink={true}
              />
            </div>

            <div className="relative z-20 text-white space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B4A] block">
                Begin Your Journey
              </span>
              <h2 className="font-serif text-2xl xl:text-3xl font-light leading-snug">
                Experience bespoke hospitality tailored for you.
              </h2>
              <p className="text-xs text-stone-300 font-light leading-relaxed">
                Create your Daranga Villa account to unlock personalized booking requests and exclusive privileges.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: SIGNUP FORM */}
          <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            
            {/* Header */}
            <div className="mb-6">
              <div className="lg:hidden mb-4">
                <DarangaLogo
                  variant="horizontal"
                  size="md"
                  withTagline={true}
                  asLink={true}
                />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#171513] dark:text-[#F4EFE5] tracking-tight">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-1 font-light">
                Join Daranga Villa to start planning your stays.
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jainam Kothari"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Phone Number <span className="text-stone-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 mt-2 rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] font-medium text-xs uppercase tracking-[0.2em] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Google Signup Option */}
            <div className="mt-5">
              <div className="relative mb-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DDD5C7] dark:border-[#282520]" />
                </div>
                <span className="relative px-3 bg-white dark:bg-[#151412] text-[11px] uppercase tracking-widest text-[#6E685F] dark:text-[#A9A39A]">
                  OR
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] hover:bg-[#EAE4D8] dark:hover:bg-[#25221E] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold text-[#171513] dark:text-[#F4EFE5] transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Footer link */}
            <div className="mt-6 pt-5 border-t border-[#DDD5C7] dark:border-[#282520] text-center">
              <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">
                Already have an account?{" "}
                <Link
                  href={`/login${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                  className="font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
