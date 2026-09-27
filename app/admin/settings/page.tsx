import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Shield, Globe } from "lucide-react";

export default async function AdminSettingsPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <AdminLayoutShell adminName={admin.name} adminEmail={admin.email} pageTitle="Settings">
      <div className="border-b border-[#E8E8E8] dark:border-[#383633] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#202020] dark:text-[#FCFBF8]">
          System Settings &amp; Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#66635F] dark:text-[#BDB8B0] mt-0.5">
          Manage admin profile credentials, system defaults, and operational parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Left Column: Admin Account Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#E8E8E8] dark:border-[#383633] pb-3">
            <div className="w-10 h-10 rounded-full bg-[#202020] text-white font-bold text-base flex items-center justify-center">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#202020] dark:text-[#FCFBF8]">
                {admin.name}
              </h3>
              <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                {admin.email}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-[#66635F] dark:text-[#BDB8B0]">
            <div className="flex justify-between py-1 border-b border-[#E8E8E8]/60 dark:border-[#383633]">
              <span>Role</span>
              <strong className="text-[#202020] dark:text-[#FCFBF8]">Super Administrator</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8E8E8]/60 dark:border-[#383633]">
              <span>Session Status</span>
              <span className="text-[#3F7658] font-semibold">● Active (JWT Cookie)</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Security Access</span>
              <strong className="text-[#202020] dark:text-[#FCFBF8]">Full Portfolio Access</strong>
            </div>
          </div>
        </div>

        {/* Right Column (2/3): Operational Defaults */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hospitality Defaults Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8E8E8] dark:border-[#383633] pb-3">
              <Globe className="w-4 h-4 text-[#EFA1AA]" />
              <h3 className="font-serif text-base font-bold text-[#202020] dark:text-[#FCFBF8]">
                Property System Defaults
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                  Default Currency
                </label>
                <input
                  type="text"
                  disabled
                  value="INR (₹) - Indian Rupee"
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-semibold text-[#202020] dark:text-[#FCFBF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  disabled
                  value="Asia/Kolkata (IST +05:30)"
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-semibold text-[#202020] dark:text-[#FCFBF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                  Standard Check-In Time
                </label>
                <input
                  type="text"
                  disabled
                  value="2:00 PM (14:00)"
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-semibold text-[#202020] dark:text-[#FCFBF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                  Standard Check-Out Time
                </label>
                <input
                  type="text"
                  disabled
                  value="11:00 AM (11:00)"
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-semibold text-[#202020] dark:text-[#FCFBF8]"
                />
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E8E8E8] dark:border-[#383633] pb-3">
              <Shield className="w-4 h-4 text-[#EFA1AA]" />
              <h3 className="font-serif text-base font-bold text-[#202020] dark:text-[#FCFBF8]">
                Security &amp; Session Protection
              </h3>
            </div>
            <p className="text-[#66635F] dark:text-[#BDB8B0]">
              Administrative sessions are protected using HTTP-only JWT cookies with bcrypt password hashing. All API mutations require verified admin credentials.
            </p>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
