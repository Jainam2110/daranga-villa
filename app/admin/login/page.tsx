"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { DarangaLogo } from "@/components/brand/daranga-logo";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password.");
      }

      // Hard redirect to dashboard to ensure fresh document request with new session cookie
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9] dark:bg-[#171717] px-4 py-12 text-[#202020] dark:text-[#FCFBF8] transition-colors duration-200">
      <div className="w-full max-w-md space-y-7 bg-white dark:bg-[#202020] p-8 sm:p-10 rounded-2xl border border-[#E8E8E8] dark:border-[#383633] shadow-sm">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <DarangaLogo variant="stacked" size="lg" withTagline={false} asLink={true} />
          <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#EFA1AA] font-semibold pt-1">
            Administrative Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/40 text-[#C94A4A] dark:text-red-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#8A8782] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#66635F] dark:text-[#8A8782]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] placeholder-[#66635F] dark:placeholder-[#8A8782] focus:outline-none focus:border-[#EFA1AA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#8A8782] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#66635F] dark:text-[#8A8782]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] placeholder-[#66635F] dark:placeholder-[#8A8782] focus:outline-none focus:border-[#EFA1AA]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#202020] hover:bg-[#171717] text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Admin Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-[#E8E8E8] dark:border-[#383633] text-center text-[11px] text-[#66635F] dark:text-[#8A8782] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#EFA1AA]" />
          <span>Protected Administrative Access</span>
        </div>
      </div>
    </div>
  );
}
