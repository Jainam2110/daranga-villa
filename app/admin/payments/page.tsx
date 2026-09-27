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
      <div className="border-b border-[#E8E8E8] dark:border-[#383633] pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#202020] dark:text-[#FCFBF8]">
          Payments &amp; Financial Ledger
        </h1>
        <p className="text-xs sm:text-sm text-[#66635F] dark:text-[#BDB8B0] mt-0.5">
          Monitor online gateway transactions, payment statuses, and reservation revenue logs.
        </p>
      </div>

      <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#E8E8E8] dark:border-[#383633] overflow-hidden shadow-xs">
        {serializedPayments.length === 0 ? (
          <div className="p-12 text-center text-[#66635F] dark:text-[#BDB8B0] space-y-3">
            <CreditCard className="w-10 h-10 mx-auto text-[#8A8782]" />
            <h3 className="font-semibold text-[#202020] dark:text-[#FCFBF8] text-sm">No payment records found</h3>
            <p className="text-xs max-w-sm mx-auto">
              Payments will appear here once online payments are enabled or recorded for guest stays.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F6F3] dark:bg-[#171717] border-b border-[#E8E8E8] dark:border-[#383633] text-[#66635F] dark:text-[#BDB8B0] uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Villa</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8]/60 dark:divide-[#383633] text-[#202020] dark:text-[#FCFBF8]">
                {serializedPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F7F6F3]/50 dark:hover:bg-[#171717]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#66635F] dark:text-[#BDB8B0]">
                      #{p._id.slice(-8).toUpperCase()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#202020] dark:text-[#FCFBF8]">{p.guestName}</div>
                      <div className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">{p.guestEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[#66635F] dark:text-[#BDB8B0]">
                      {p.villaName}
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans font-bold text-[#202020] dark:text-[#FCFBF8]">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          p.paymentStatus === "PAID"
                            ? "bg-[#3F7658]/10 text-[#3F7658] border border-[#3F7658]/30"
                            : p.paymentStatus === "PENDING"
                            ? "bg-[#D9822B]/10 text-[#D9822B] border border-[#D9822B]/30"
                            : p.paymentStatus === "FAILED"
                            ? "bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/30"
                            : "bg-[#8A8782]/10 text-[#66635F] border border-[#DAD7D1]"
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#66635F] dark:text-[#BDB8B0]">
                      {p.paymentMethod}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[#66635F] dark:text-[#BDB8B0]">
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
