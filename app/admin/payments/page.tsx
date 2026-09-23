import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking, { IBooking } from "@/models/Booking";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { formatCurrency } from "@/lib/utils/pricing";
import { CreditCard } from "lucide-react";

export default async function AdminPaymentsPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  const bookingsRaw = await Booking.find({ paymentStatus: { $exists: true } })
    .populate("villaId", "name")
    .sort({ createdAt: -1 })
    .lean<IBooking[]>();

  const serializedPayments = bookingsRaw.map((b) => {
    const villaObj = typeof b.villaId === "object" && b.villaId !== null
      ? (b.villaId as unknown as { name?: string })
      : {};

    return {
      _id: b._id.toString(),
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      villaName: villaObj.name || "Villa Residence",
      amount: b.totalAmount,
      paymentStatus: b.paymentStatus || "UNPAID",
      paymentMethod: b.externalBookingId ? "Online Gateway (Razorpay)" : "Manual / Direct",
      date: b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—",
    };
  });

  return (
    <AdminLayoutShell adminName={admin.name} adminEmail={admin.email} pageTitle="Payments">
      <div className="border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171513] dark:text-[#F4EFE5]">
          Payments &amp; Financial Ledger
        </h1>
        <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A9A39A] mt-0.5">
          Monitor online gateway transactions, payment statuses, and reservation revenue logs.
        </p>
      </div>

      <div className="bg-white dark:bg-[#151412] rounded-xl border border-[#DDD5C7] dark:border-[#302D28] overflow-hidden shadow-xs">
        {serializedPayments.length === 0 ? (
          <div className="p-12 text-center text-[#6E685F] dark:text-[#A9A39A] space-y-3">
            <CreditCard className="w-10 h-10 mx-auto text-[#6E685F]/40 dark:text-[#A9A39A]/40" />
            <h3 className="font-semibold text-[#171513] dark:text-[#F4EFE5] text-sm">No payment records found</h3>
            <p className="text-xs max-w-sm mx-auto">
              Payments will appear here once online payments are enabled or recorded for guest stays.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border-b border-[#DDD5C7] dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Villa</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD5C7]/40 dark:divide-[#302D28]/60 text-[#171513] dark:text-[#F4EFE5]">
                {serializedPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F5F2EC]/50 dark:hover:bg-[#1C1A17]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#6E685F] dark:text-[#A9A39A]">
                      #{p._id.slice(-8).toUpperCase()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#171513] dark:text-[#F4EFE5]">{p.guestName}</div>
                      <div className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">{p.guestEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[#6E685F] dark:text-[#A9A39A]">
                      {p.villaName}
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans font-bold text-[#171513] dark:text-[#F4EFE5]">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                          p.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                            : p.paymentStatus === "PENDING"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                            : p.paymentStatus === "FAILED"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                            : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#6E685F] dark:text-[#A9A39A]">
                      {p.paymentMethod}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[#6E685F] dark:text-[#A9A39A]">
                      {p.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
