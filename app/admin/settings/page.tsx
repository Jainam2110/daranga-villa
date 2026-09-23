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
      <div className="border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171513] dark:text-[#F4EFE5]">
          System Settings &amp; Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-0.5">
          Manage admin profile credentials, system defaults, and operational parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Left Column: Admin Account Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#DDD5C7]/60 dark:border-[#302D28] pb-3">
            <div className="w-10 h-10 rounded-full bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] font-bold text-base flex items-center justify-center">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#171513] dark:text-[#F4EFE5]">
                {admin.name}
              </h3>
              <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                {admin.email}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-[#6E685F] dark:text-[#A9A39A]">
            <div className="flex justify-between py-1 border-b border-[#DDD5C7]/30 dark:border-[#302D28]">
              <span>Role</span>
              <strong className="text-[#171513] dark:text-[#F4EFE5]">Super Administrator</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#DDD5C7]/30 dark:border-[#302D28]">
              <span>Session Status</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">● Active (JWT Cookie)</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Security Access</span>
              <strong className="text-[#171513] dark:text-[#F4EFE5]">Full Portfolio Access</strong>
            </div>
          </div>
        </div>

        {/* Right Column (2/3): Operational Defaults */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hospitality Defaults Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DDD5C7]/60 dark:border-[#302D28] pb-3">
              <Globe className="w-4 h-4 text-[#A8792E] dark:text-[#C89B4A]" />
              <h3 className="font-serif text-base font-bold text-[#171513] dark:text-[#F4EFE5]">
                Property System Defaults
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Default Currency
                </label>
                <input
                  type="text"
                  disabled
                  value="INR (₹) - Indian Rupee"
                  className="w-full px-3 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold text-[#171513] dark:text-[#F4EFE5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  disabled
                  value="Asia/Kolkata (IST +05:30)"
                  className="w-full px-3 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold text-[#171513] dark:text-[#F4EFE5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Standard Check-In Time
                </label>
                <input
                  type="text"
                  disabled
                  value="2:00 PM (14:00)"
                  className="w-full px-3 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold text-[#171513] dark:text-[#F4EFE5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Standard Check-Out Time
                </label>
                <input
                  type="text"
                  disabled
                  value="11:00 AM (11:00)"
                  className="w-full px-3 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold text-[#171513] dark:text-[#F4EFE5]"
                />
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#DDD5C7]/60 dark:border-[#302D28] pb-3">
              <Shield className="w-4 h-4 text-[#A8792E] dark:text-[#C89B4A]" />
              <h3 className="font-serif text-base font-bold text-[#171513] dark:text-[#F4EFE5]">
                Security &amp; Session Protection
              </h3>
            </div>
            <p className="text-[#6E685F] dark:text-[#A9A39A]">
              Administrative sessions are protected using HTTP-only JWT cookies with bcrypt password hashing. All API mutations require verified admin credentials.
            </p>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
