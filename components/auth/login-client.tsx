"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";
import { getFriendlyAuthErrorMessage } from "@/lib/firebase/errors";
import { DarangaLogo } from "@/components/brand/daranga-logo";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { customer, firebaseUser, syncProfile } = useCustomerAuth();

  // Auth Modes: 'email' | 'phone' | 'forgot'
  const [authMode, setAuthMode] = useState<"email" | "phone" | "forgot">("email");

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone OTP state
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Status & Error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (firebaseUser && customer) {
      router.push(redirectUrl);
    }
  }, [firebaseUser, customer, router, redirectUrl]);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // 1. Email Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncProfile();
      router.push(redirectUrl);
    } catch (err) {
      console.error("Email sign in error:", err);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Google Sign In
  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setIsSubmitting(true);
      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, googleProvider);
      } catch (popupErr: unknown) {
        const error = popupErr as { code?: string };
        if (
          error.code === "auth/popup-blocked" ||
          error.code === "auth/popup-closed-by-user" ||
          error.code === "auth/cancelled-popup-request"
        ) {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupErr;
      }

      if (userCredential && userCredential.user) {
        await syncProfile();
        router.push(redirectUrl);
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Send Phone OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {},
        });
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhone,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccessMessage(`Verification code sent to ${fullPhone}`);
    } catch (err) {
      console.error("Phone sign in error:", err);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otpCode.trim() || otpCode.length < 6) {
      setErrorMessage("Please enter the 6-digit code.");
      return;
    }

    if (!confirmationResult) {
      setErrorMessage("Please request a new OTP code.");
      setOtpSent(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await confirmationResult.confirm(otpCode);
      await syncProfile(undefined, `${countryCode}${phoneNumber.trim()}`);
      router.push(redirectUrl);
    } catch (err) {
      console.error("OTP verification error:", err);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Send Password Reset Email
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage(
        `Password reset instructions sent to ${email.trim()}. Please check your inbox and spam folder.`
      );
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A] p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#C89B4A] selection:text-[#0B0B0A] transition-colors duration-200">
      {/* Invisible Recaptcha Anchor */}
      <div id="recaptcha-container" />

      {/* Main Card Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#151412] rounded-2xl shadow-2xl border border-[#DDD5C7] dark:border-[#302D28] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* LEFT COLUMN: EDITORIAL VISUAL / SANCTUARY BRANDING */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-[#1c1917] p-8 flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35 z-10" />
            <Image
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
              alt="Daranga Villa Luxury Sanctuary"
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
                Exclusive Sanctuary
              </span>
              <h2 className="font-serif text-2xl xl:text-3xl font-light leading-snug">
                Welcome back to your private retreat.
              </h2>
              <p className="text-xs text-stone-300 font-light leading-relaxed">
                Sign in to manage your stays, access exclusive resident privileges, and curate your next experience.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: AUTHENTICATION FORM */}
          <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            
            {/* Header */}
            <div className="mb-8">
              <div className="lg:hidden mb-5">
                <DarangaLogo
                  variant="horizontal"
                  size="md"
                  withTagline={true}
                  asLink={true}
                />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#171513] dark:text-[#F4EFE5] tracking-tight">
                {authMode === "email" && "Sign In"}
                {authMode === "phone" && "Sign In with Phone"}
                {authMode === "forgot" && "Reset Password"}
              </h1>
              <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-1 font-light">
                {authMode === "email" && "Sign in to continue your stay with Daranga Villa."}
                {authMode === "phone" && "Enter your phone number to receive a secure one-time verification code."}
                {authMode === "forgot" && "Enter your email address to receive password recovery instructions."}
              </p>
            </div>

            {/* Global Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Global Success Alert */}
            {successMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* FORM 1: EMAIL + PASSWORD */}
            {authMode === "email" && (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-3 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A] transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setSuccessMessage("");
                        setAuthMode("forgot");
                      }}
                      className="text-xs text-[#A8792E] dark:text-[#C89B4A] hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] font-medium text-xs uppercase tracking-[0.2em] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            )}

            {/* FORM 2: PHONE OTP */}
            {authMode === "phone" && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1.5">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="px-3 py-3 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                        >
                          <option value="+91">🇮🇳 +91 (IN)</option>
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+971">🇦🇪 +971 (UAE)</option>
                          <option value="+65">🇸🇬 +65 (SG)</option>
                          <option value="+61">🇦🇺 +61 (AU)</option>
                        </select>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="9876543210"
                          className="flex-1 px-4 py-3 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                        />
                      </div>
                      <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A] mt-1">
                        We will send a 6-digit SMS verification code to your phone.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] font-medium text-xs uppercase tracking-[0.2em] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <span>Send OTP</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                          Enter 6-Digit Code
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode("");
                          }}
                          className="text-xs text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full px-4 py-3 text-center tracking-[0.4em] font-mono text-lg rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] font-medium text-xs uppercase tracking-[0.2em] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Sign In</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* FORM 3: FORGOT PASSWORD */}
            {authMode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1.5">
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-3 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-sm text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:border-[#C89B4A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] font-medium text-xs uppercase tracking-[0.2em] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Sending reset email...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSuccessMessage("");
                      setAuthMode("email");
                    }}
                    className="text-xs text-[#A8792E] dark:text-[#C89B4A] hover:underline font-medium"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ALTERNATIVE PROVIDERS & SWITCHES */}
            {authMode !== "forgot" && (
              <>
                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#DDD5C7] dark:border-[#282520]" />
                  </div>
                  <span className="relative px-3 bg-white dark:bg-[#151412] text-[11px] uppercase tracking-widest text-[#6E685F] dark:text-[#A9A39A]">
                    OR
                  </span>
                </div>

                {/* Social / Alternate buttons */}
                <div className="space-y-2.5">
                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
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
                    <span>Continue with Google</span>
                  </button>

                  {/* Switch to Phone / Email */}
                  {authMode === "email" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setSuccessMessage("");
                        setAuthMode("phone");
                      }}
                      className="w-full py-3 px-4 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] hover:bg-[#EAE4D8] dark:hover:bg-[#25221E] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold text-[#171513] dark:text-[#F4EFE5] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-[#A8792E] dark:text-[#C89B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                      <span>Continue with Phone</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setSuccessMessage("");
                        setAuthMode("email");
                      }}
                      className="w-full py-3 px-4 rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] hover:bg-[#EAE4D8] dark:hover:bg-[#25221E] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold text-[#171513] dark:text-[#F4EFE5] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-[#A8792E] dark:text-[#C89B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <span>Continue with Email & Password</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Footer switch to Signup */}
            <div className="mt-8 pt-6 border-t border-[#DDD5C7] dark:border-[#282520] text-center">
              <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/signup${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                  className="font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
