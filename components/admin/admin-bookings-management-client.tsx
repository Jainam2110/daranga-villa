"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/pricing";
import {
  Search,
  Eye,
  X,
  BookOpenCheck,
  Plus,
  AlertTriangle,
} from "lucide-react";

export interface SerializedBooking {
  _id: string;
  villaId: string;
  villaName: string;
  villaSlug: string;
  villaLocation?: string;
  villaImage?: string;
  pricePerNight?: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  source: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | string;
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentHoldExpiresAt?: string;
  externalBookingId?: string;
  notes?: string;
  createdAt: string;
}

export interface VillaOption {
  id: string;
  name: string;
  slug: string;
  maxGuests: number;
  pricePerNight: number;
  location?: string;
}

interface AdminBookingsManagementClientProps {
  initialBookings: SerializedBooking[];
  villas: VillaOption[];
}

export function AdminBookingsManagementClient({
  initialBookings,
  villas = [],
}: AdminBookingsManagementClientProps) {
  const [bookings, setBookings] = useState<SerializedBooking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [villaFilter, setVillaFilter] = useState<string>("ALL");

  // Detail Modal State
  const [selectedBooking, setSelectedBooking] = useState<SerializedBooking | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  // Cancel Confirmation Dialog
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Manual Booking Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualVillaId, setManualVillaId] = useState(villas.length > 0 ? villas[0].id : "");
  const [manualCheckIn, setManualCheckIn] = useState("");
  const [manualCheckOut, setManualCheckOut] = useState("");
  const [manualGuests, setManualGuests] = useState(2);
  const [manualGuestName, setManualGuestName] = useState("");
  const [manualGuestEmail, setManualGuestEmail] = useState("");
  const [manualGuestPhone, setManualGuestPhone] = useState("");
  const [manualSource, setManualSource] = useState("ADMIN");
  const [manualPaymentStatus, setManualPaymentStatus] = useState<"PAID" | "UNPAID">("PAID");
  const [manualNotes, setManualNotes] = useState("");
  const [manualError, setManualError] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  const selectedVilla = villas.find((v) => v.id === manualVillaId);

  // Refetch bookings from server API
  const refreshBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(data.data || []);
      }
    } catch (err) {
      console.error("Failed to refresh bookings:", err);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestPhone.includes(searchQuery) ||
      booking.villaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || booking.status === statusFilter;

    const matchesPayment =
      paymentFilter === "ALL" || booking.paymentStatus === paymentFilter;

    const matchesVilla =
      villaFilter === "ALL" || booking.villaName === villaFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesVilla;
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
            CONFIRMED
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            PENDING
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {status}
          </span>
        );
    }
  };

  const renderPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PAID":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
            PAID
          </span>
        );
      case "UNPAID":
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            UNPAID
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {paymentStatus}
          </span>
        );
    }
  };

  // Submit Manual Booking Creation
  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");

    if (!manualVillaId) {
      setManualError("Please select a villa residence.");
      return;
    }

    if (!manualCheckIn || !manualCheckOut) {
      setManualError("Check-in and check-out dates are required.");
      return;
    }

    if (manualCheckOut <= manualCheckIn) {
      setManualError("Check-out date must be after check-in date.");
      return;
    }

    if (!manualGuestName.trim() || !manualGuestEmail.trim() || !manualGuestPhone.trim()) {
      setManualError("Guest name, email, and phone number are required.");
      return;
    }

    setSubmittingManual(true);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          villaId: manualVillaId,
          checkIn: manualCheckIn,
          checkOut: manualCheckOut,
          guests: manualGuests,
          guestName: manualGuestName.trim(),
          guestEmail: manualGuestEmail.trim(),
          guestPhone: manualGuestPhone.trim(),
          source: manualSource,
          paymentStatus: manualPaymentStatus,
          notes: manualNotes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create manual booking.");
      }

      setIsManualModalOpen(false);
      setManualCheckIn("");
      setManualCheckOut("");
      setManualGuestName("");
      setManualGuestEmail("");
      setManualGuestPhone("");
      setManualNotes("");
      await refreshBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating booking";
      setManualError(msg);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Handle Admin Booking Cancellation
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to cancel booking.");
        return;
      }

      setShowCancelConfirm(false);
      setSelectedBooking(null);
      await refreshBookings();
    } catch {
      alert("Network error cancelling booking.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Admin Notes Update
  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notesDraft.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedBooking((prev) => (prev ? { ...prev, notes: notesDraft.trim() } : prev));
        await refreshBookings();
      }
    } catch {
      alert("Failed to save notes.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls & Action Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6E685F] dark:text-[#A9A39A]" />
          <input
            type="text"
            placeholder="Search guest name, email, phone, villa, or booking reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs text-[#171513] dark:text-[#F4EFE5] placeholder-[#6E685F] dark:placeholder-[#A9A39A] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
          />
        </div>

        {/* Filters & Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-medium text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-medium text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">PAID</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>

          {/* Villa Filter */}
          {villas.length > 0 && (
            <select
              value={villaFilter}
              onChange={(e) => setVillaFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-medium text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
            >
              <option value="ALL">All Villas</option>
              {villas.map((v) => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          )}

          {/* Create Manual Booking Button */}
          <button
            onClick={() => {
              setManualError("");
              setIsManualModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] transition-colors shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Create Booking</span>
          </button>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white dark:bg-[#151412] rounded-xl border border-[#DDD5C7] dark:border-[#302D28] overflow-hidden shadow-xs">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-[#6E685F] dark:text-[#A9A39A] space-y-3">
            <BookOpenCheck className="w-10 h-10 mx-auto text-[#6E685F]/40 dark:text-[#A9A39A]/40" />
            <h3 className="font-semibold text-[#171513] dark:text-[#F4EFE5] text-sm">No reservations found</h3>
            <p className="text-xs max-w-sm mx-auto">
              No bookings match your current search and filter criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card List View (< md) */}
            <div className="md:hidden divide-y divide-[#DDD5C7]/40 dark:divide-[#302D28]/60">
              {filteredBookings.map((b) => {
                const checkInStr = new Date(b.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
                const checkOutStr = new Date(b.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

                return (
                  <div key={b._id} className="p-4 space-y-3 hover:bg-[#F5F2EC]/30 dark:hover:bg-[#1C1A17]/30 transition-colors">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A]">
                        #{b._id.slice(-8).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[9px] font-semibold rounded bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] uppercase">
                          {b.source}
                        </span>
                        {renderStatusBadge(b.status)}
                        {renderPaymentBadge(b.paymentStatus)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-[#171513] dark:text-[#F4EFE5]">{b.guestName}</h4>
                      <p className="text-xs text-[#6E685F] dark:text-[#A9A39A]">{b.guestEmail} • {b.guestPhone}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-[#DDD5C7]/30 dark:border-[#302D28]/40">
                      <div>
                        <span className="font-medium text-[#171513] dark:text-[#F4EFE5] block">{b.villaName}</span>
                        <span className="text-[#6E685F] dark:text-[#A9A39A] text-[11px] block">{checkInStr} → {checkOutStr} ({b.guests} guests)</span>
                      </div>

                      <div className="text-right">
                        <span className="font-sans font-bold text-sm text-[#171513] dark:text-[#F4EFE5] block">
                          {formatCurrency(b.totalAmount)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setNotesDraft(b.notes || "");
                            setShowCancelConfirm(false);
                          }}
                          className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border border-[#DDD5C7] dark:border-[#302D28] hover:border-[#C89B4A] text-[#A8792E] dark:text-[#C89B4A] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border-b border-[#DDD5C7] dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] uppercase text-[10px] font-semibold tracking-wider">
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Villa</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4 text-center">Guests</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Source</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Payment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD5C7]/40 dark:divide-[#302D28]/60 text-[#171513] dark:text-[#F4EFE5]">
                  {filteredBookings.map((b) => {
                    const checkInStr = new Date(b.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
                    const checkOutStr = new Date(b.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

                    return (
                      <tr key={b._id} className="hover:bg-[#F5F2EC]/50 dark:hover:bg-[#1C1A17]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#A8792E] dark:text-[#C89B4A]">
                          #{b._id.slice(-8).toUpperCase()}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#171513] dark:text-[#F4EFE5]">{b.guestName}</div>
                          <div className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">{b.guestEmail} • {b.guestPhone}</div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-[#171513] dark:text-[#F4EFE5]">
                          {b.villaName}
                        </td>

                        <td className="py-3.5 px-4 text-[#6E685F] dark:text-[#A9A39A] whitespace-nowrap">
                          {checkInStr} → {checkOutStr}
                        </td>

                        <td className="py-3.5 px-4 text-center font-medium">
                          {b.guests}
                        </td>

                        <td className="py-3.5 px-4 text-right font-sans font-bold text-[#171513] dark:text-[#F4EFE5]">
                          {formatCurrency(b.totalAmount)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] uppercase">
                            {b.source}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {renderStatusBadge(b.status)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {renderPaymentBadge(b.paymentStatus)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setNotesDraft(b.notes || "");
                              setShowCancelConfirm(false);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Manual Booking Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#151412] rounded-2xl border border-[#DDD5C7] dark:border-[#302D28] p-6 space-y-5 shadow-2xl text-xs text-[#171513] dark:text-[#F4EFE5]">
            <div className="flex items-center justify-between border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-3.5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#171513] dark:text-[#F4EFE5]">
                  Create Manual / Direct Booking
                </h3>
                <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                  Reserve villa dates directly for offline, phone, or administrative bookings.
                </p>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs">
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Select Villa Residence *
                </label>
                <select
                  required
                  value={manualVillaId}
                  onChange={(e) => setManualVillaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold"
                >
                  {villas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Max {v.maxGuests} Guests • ₹{v.pricePerNight.toLocaleString("en-IN")}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Check-In Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualCheckIn}
                    onChange={(e) => setManualCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Check-Out Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualCheckOut}
                    onChange={(e) => setManualCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedVilla?.maxGuests || 10}
                    required
                    value={manualGuests}
                    onChange={(e) => setManualGuests(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Booking Source
                  </label>
                  <select
                    value={manualSource}
                    onChange={(e) => setManualSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-medium"
                  >
                    <option value="ADMIN">ADMIN (Direct Manual)</option>
                    <option value="PHONE">PHONE</option>
                    <option value="WHATSAPP">WHATSAPP</option>
                    <option value="AIRBNB">AIRBNB</option>
                    <option value="BOOKING_COM">BOOKING.COM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={manualGuestName}
                  onChange={(e) => setManualGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Guest Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="guest@example.com"
                    value={manualGuestEmail}
                    onChange={(e) => setManualGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Guest Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={manualGuestPhone}
                    onChange={(e) => setManualGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                  Payment Authority Status
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="manualPaymentStatus"
                      value="PAID"
                      checked={manualPaymentStatus === "PAID"}
                      onChange={() => setManualPaymentStatus("PAID")}
                      className="text-[#C89B4A]"
                    />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Mark as PAID (Direct Payment)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="manualPaymentStatus"
                      value="UNPAID"
                      checked={manualPaymentStatus === "UNPAID"}
                      onChange={() => setManualPaymentStatus("UNPAID")}
                      className="text-[#C89B4A]"
                    />
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Mark as UNPAID (Pending)</span>
                  </label>
                </div>
                <p className="text-[10px] text-[#6E685F] dark:text-[#A9A39A] font-light">
                  Manual bookings do NOT trigger Razorpay gateway checkout or fabricate Razorpay IDs.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Notes & Special Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional admin/concierge notes..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#DDD5C7]/70 dark:border-[#302D28] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] transition-colors uppercase tracking-wider shadow-xs"
                >
                  {submittingManual ? "Creating..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Detail Modal Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#151412] rounded-2xl border border-[#DDD5C7] dark:border-[#302D28] p-6 space-y-5 shadow-2xl text-xs text-[#171513] dark:text-[#F4EFE5] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DDD5C7]/70 dark:border-[#302D28] pb-3.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B4A] block">
                  Reservation Details
                </span>
                <h3 className="font-serif text-xl font-bold text-[#171513] dark:text-[#F4EFE5]">
                  #{selectedBooking._id.slice(-8).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setShowCancelConfirm(false);
                }}
                className="p-1 rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Confirmation Dialog for Cancellation */}
            {showCancelConfirm ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-rose-500 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Confirm Admin Cancellation</span>
                </div>
                <p className="text-[#171513] dark:text-[#F4EFE5] font-light leading-relaxed">
                  Cancelling this reservation will immediately release the villa dates ({new Date(selectedBooking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → {new Date(selectedBooking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}) back into available inventory for website customers.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#151412] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28]"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    disabled={isUpdatingStatus}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                  >
                    {isUpdatingStatus ? "Cancelling..." : "Confirm Cancellation"}
                  </button>
                </div>
              </div>
            ) : (
              /* Main Details Content */
              <div className="space-y-3.5">
                {/* Residence & Visual Preview */}
                <div className="p-3.5 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] flex items-center gap-3">
                  {selectedBooking.villaImage && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#1c1917] flex-shrink-0">
                      <Image
                        src={selectedBooking.villaImage}
                        alt={selectedBooking.villaName}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] tracking-wider block">
                      Villa Residence
                    </span>
                    <span className="font-serif text-base font-bold text-[#171513] dark:text-[#F4EFE5] block">
                      {selectedBooking.villaName}
                    </span>
                    <span className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                      📍 {selectedBooking.villaLocation || "Kutch"}
                    </span>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="p-3.5 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] tracking-wider block">
                    Guest Information
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#6E685F] dark:text-[#A9A39A] block text-[10px]">Guest Name</span>
                      <span className="font-semibold">{selectedBooking.guestName}</span>
                    </div>
                    <div>
                      <span className="text-[#6E685F] dark:text-[#A9A39A] block text-[10px]">Email</span>
                      <span className="font-semibold truncate block">{selectedBooking.guestEmail}</span>
                    </div>
                    <div>
                      <span className="text-[#6E685F] dark:text-[#A9A39A] block text-[10px]">Phone</span>
                      <span className="font-semibold">{selectedBooking.guestPhone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[#6E685F] dark:text-[#A9A39A] block text-[10px]">Guests</span>
                      <span className="font-semibold">{selectedBooking.guests} Guests</span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Financial Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28]">
                    <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] block">Check-In</span>
                    <span className="font-semibold text-xs">{new Date(selectedBooking.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28]">
                    <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] block">Check-Out</span>
                    <span className="font-semibold text-xs">{new Date(selectedBooking.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>

                {/* Financial Authority Card */}
                <div className="p-4 rounded-xl bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] block">Total Amount</span>
                      <span className="font-serif text-xl font-bold text-[#A8792E] dark:text-[#C89B4A]">
                        {formatCurrency(selectedBooking.totalAmount)}
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      {renderStatusBadge(selectedBooking.status)}
                      <div className="pt-1">{renderPaymentBadge(selectedBooking.paymentStatus)}</div>
                    </div>
                  </div>

                  {selectedBooking.razorpayPaymentId && (
                    <div className="text-[10px] text-[#6E685F] dark:text-[#A9A39A] font-mono border-t border-[#DDD5C7]/60 dark:border-[#302D28] pt-2">
                      Razorpay Payment ID: {selectedBooking.razorpayPaymentId}
                    </div>
                  )}
                </div>

                {/* Admin Notes Section */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                    Admin Notes
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Add admin notes..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isUpdatingStatus}
                      className="px-3 py-2 bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#DDD5C7]/70 dark:border-[#302D28] flex items-center justify-between">
              {selectedBooking.status !== "CANCELLED" && !showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 hover:bg-rose-100 transition-colors"
                >
                  Cancel Reservation
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setShowCancelConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A]"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
