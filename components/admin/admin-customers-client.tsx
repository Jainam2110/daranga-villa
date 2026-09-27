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
      <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#66635F] dark:text-[#BDB8B0]" />
          <input
            type="text"
            placeholder="Search customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] placeholder-[#8A8782] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
          />
        </div>
        <span className="text-xs font-semibold text-[#66635F] dark:text-[#BDB8B0]">
          Total: {customers.length} Guests
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#E8E8E8] dark:border-[#383633] overflow-hidden shadow-xs">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-[#66635F] dark:text-[#BDB8B0] space-y-3">
            <Users className="w-10 h-10 mx-auto text-[#8A8782]" />
            <h3 className="font-semibold text-[#202020] dark:text-[#FCFBF8] text-sm">No customers found</h3>
            <p className="text-xs max-w-sm mx-auto">
              When guests place reservations, their customer profile will automatically be created here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F6F3] dark:bg-[#171717] border-b border-[#E8E8E8] dark:border-[#383633] text-[#66635F] dark:text-[#BDB8B0] uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Bookings</th>
                  <th className="py-3 px-4">Last Stay Date</th>
                  <th className="py-3 px-4 text-right">Total Spend</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8]/60 dark:divide-[#383633] text-[#202020] dark:text-[#FCFBF8]">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F6F3]/50 dark:hover:bg-[#171717]/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#202020] dark:text-[#FCFBF8]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#202020] dark:bg-[#FFFFFF] text-white dark:text-[#202020] font-bold text-xs flex items-center justify-center">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">{c.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold font-sans">
                      {c.totalBookings}
                    </td>

                    <td className="py-3.5 px-4 text-[#66635F] dark:text-[#BDB8B0]">
                      {new Date(c.lastBookingDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans font-bold text-[#202020] dark:text-[#FCFBF8]">
                      {formatCurrency(c.totalSpend)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] hover:text-[#EFA1AA] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#EFA1AA]" />
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
          <div className="w-full max-w-lg bg-white dark:bg-[#202020] rounded-2xl border border-[#E8E8E8] dark:border-[#383633] p-6 space-y-5 shadow-2xl text-xs text-[#202020] dark:text-[#FCFBF8] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] dark:border-[#383633] pb-3.5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                  Customer Profile
                </h3>
                <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">
                  Guest history and stay metrics
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-[#66635F] dark:text-[#BDB8B0] hover:bg-[#F7F6F3] dark:hover:bg-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383633] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#202020] dark:bg-[#FFFFFF] text-white dark:text-[#202020] font-bold text-base flex items-center justify-center">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold">{selectedCustomer.name}</h4>
                  <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383633]">
                  <span className="text-[10px] uppercase font-semibold text-[#66635F] dark:text-[#BDB8B0] block">Total Bookings</span>
                  <span className="font-sans text-lg font-bold">{selectedCustomer.totalBookings} Stays</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383633]">
                  <span className="text-[10px] uppercase font-semibold text-[#66635F] dark:text-[#BDB8B0] block">Lifetime Value</span>
                  <span className="font-sans text-lg font-bold">{formatCurrency(selectedCustomer.totalSpend)}</span>
                </div>
              </div>

              {/* Booking History */}
              <div className="space-y-2">
                <h5 className="font-semibold text-xs text-[#66635F] dark:text-[#BDB8B0] uppercase tracking-wider">
                  Reservation History ({selectedCustomer.bookings.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedCustomer.bookings.map((b) => (
                    <div
                      key={b._id}
                      className="p-3 rounded-lg bg-[#F7F6F3]/50 dark:bg-[#171717]/50 border border-[#E8E8E8] dark:border-[#383633] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#202020] dark:text-[#FCFBF8]">{b.villaName}</div>
                        <div className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                          {new Date(b.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – {new Date(b.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-sans font-bold">{formatCurrency(b.totalAmount)}</div>
                        <span className="text-[10px] font-semibold text-[#3F7658] uppercase">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E8E8] dark:border-[#383633] text-right">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#202020] hover:bg-[#171717] text-white"
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
