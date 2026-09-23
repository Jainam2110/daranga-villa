"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils/pricing";
import { Search, Users, Eye, X } from "lucide-react";

export interface CustomerBooking {
  _id: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: string;
}

export interface SerializedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpend: number;
  lastBookingDate: string;
  bookings: CustomerBooking[];
}

interface AdminCustomersClientProps {
  initialCustomers: SerializedCustomer[];
}

export function AdminCustomersClient({ initialCustomers }: AdminCustomersClientProps) {
  const [customers] = useState<SerializedCustomer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<SerializedCustomer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
  });

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6E685F] dark:text-[#A9A39A]" />
          <input
            type="text"
            placeholder="Search customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs text-[#171513] dark:text-[#F4EFE5] placeholder-[#6E685F] dark:placeholder-[#A9A39A] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
          />
        </div>
        <span className="text-xs font-semibold text-[#6E685F] dark:text-[#A9A39A]">
          Total: {customers.length} Guests
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-[#151412] rounded-xl border border-[#DDD5C7] dark:border-[#302D28] overflow-hidden shadow-xs">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-[#6E685F] dark:text-[#A9A39A] space-y-3">
            <Users className="w-10 h-10 mx-auto text-[#6E685F]/40 dark:text-[#A9A39A]/40" />
            <h3 className="font-semibold text-[#171513] dark:text-[#F4EFE5] text-sm">No customers found</h3>
            <p className="text-xs max-w-sm mx-auto">
              When guests place reservations, their customer profile will automatically be created here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border-b border-[#DDD5C7] dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Bookings</th>
                  <th className="py-3 px-4">Last Stay Date</th>
                  <th className="py-3 px-4 text-right">Total Spend</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD5C7]/40 dark:divide-[#302D28]/60 text-[#171513] dark:text-[#F4EFE5]">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F5F2EC]/50 dark:hover:bg-[#1C1A17]/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#171513] dark:text-[#F4EFE5]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#A8792E]/10 dark:bg-[#C89B4A]/20 text-[#A8792E] dark:text-[#C89B4A] font-bold text-xs flex items-center justify-center">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">{c.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold font-sans">
                      {c.totalBookings}
                    </td>

                    <td className="py-3.5 px-4 text-[#6E685F] dark:text-[#A9A39A]">
                      {new Date(c.lastBookingDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans font-bold text-[#171513] dark:text-[#F4EFE5]">
                      {formatCurrency(c.totalSpend)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#151412] rounded-2xl border border-[#DDD5C7] dark:border-[#302D28] p-6 space-y-5 shadow-2xl text-xs text-[#171513] dark:text-[#F4EFE5] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-3.5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#171513] dark:text-[#F4EFE5]">
                  Customer Profile
                </h3>
                <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">
                  Guest history and stay metrics
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] font-bold text-base flex items-center justify-center">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold">{selectedCustomer.name}</h4>
                  <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28]">
                  <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] block">Total Bookings</span>
                  <span className="font-sans text-lg font-bold">{selectedCustomer.totalBookings} Stays</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28]">
                  <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] block">Lifetime Value</span>
                  <span className="font-sans text-lg font-bold">{formatCurrency(selectedCustomer.totalSpend)}</span>
                </div>
              </div>

              {/* Booking History */}
              <div className="space-y-2">
                <h5 className="font-semibold text-xs text-[#6E685F] dark:text-[#A9A39A] uppercase tracking-wider">
                  Reservation History ({selectedCustomer.bookings.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedCustomer.bookings.map((b) => (
                    <div
                      key={b._id}
                      className="p-3 rounded-lg bg-[#F5F2EC]/30 dark:bg-[#1C1A17]/30 border border-[#DDD5C7]/50 dark:border-[#302D28] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#171513] dark:text-[#F4EFE5]">{b.villaName}</div>
                        <div className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                          {new Date(b.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – {new Date(b.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-sans font-bold">{formatCurrency(b.totalAmount)}</div>
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DDD5C7]/70 dark:border-[#302D28] text-right">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
