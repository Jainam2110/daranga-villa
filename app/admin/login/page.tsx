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
      window.location.href = "/admin/dashboard";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#0B0B0A] px-4 py-12 text-[#171513] dark:text-[#F4EFE5] transition-colors duration-200">
      <div className="w-full max-w-md space-y-7 bg-white dark:bg-[#151412] p-8 sm:p-10 rounded-2xl border border-[#DDD5C7] dark:border-[#302D28] shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <DarangaLogo variant="stacked" size="lg" withTagline={false} asLink={true} />
          <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#A8792E] dark:text-[#C89B4A] font-semibold pt-1">
            Administrative Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#6E685F] dark:text-[#A9A39A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@darangavilla.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs text-[#171513] dark:text-[#F4EFE5] placeholder-[#6E685F] dark:placeholder-[#A9A39A] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#6E685F] dark:text-[#A9A39A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs text-[#171513] dark:text-[#F4EFE5] placeholder-[#6E685F] dark:placeholder-[#A9A39A] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] font-semibold text-xs hover:bg-[#302D28] dark:hover:bg-[#b0853c] transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Admin Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-[#DDD5C7]/60 dark:border-[#302D28] text-center text-[11px] text-[#6E685F] dark:text-[#A9A39A] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#A8792E] dark:text-[#C89B4A]" />
          <span>Protected Administrative Access</span>
        </div>
      </div>
    </div>
  );
}
