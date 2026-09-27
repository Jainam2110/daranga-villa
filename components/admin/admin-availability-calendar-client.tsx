"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils/pricing";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Clock, User, Lock } from "lucide-react";

interface VillaOption {
  id: string;
  name: string;
  slug: string;
}

interface BlockedDateItem {
  _id: string;
  villaId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

interface BookingItem {
  _id: string;
  villaId: { _id: string; name: string } | string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentHoldExpiresAt?: string;
  source: string;
}

interface AdminAvailabilityCalendarClientProps {
  villas: VillaOption[];
}

export function AdminAvailabilityCalendarClient({
  villas,
}: AdminAvailabilityCalendarClientProps) {
  const [selectedVillaId, setSelectedVillaId] = useState<string>(
    villas.length > 0 ? villas[0].id : ""
  );

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [blockedDates, setBlockedDates] = useState<BlockedDateItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [nowMs, setNowMs] = useState<number>(0);

  // Modal State for Adding Blocked Date
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockStartDate, setBlockStartDate] = useState("");
  const [blockEndDate, setBlockEndDate] = useState("");
  const [blockReason, setBlockReason] = useState("Maintenance");
  const [customReason, setCustomReason] = useState("");
  const [blockError, setBlockError] = useState("");
  const [submittingBlock, setSubmittingBlock] = useState(false);

  // Modal State for Booking Details
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedVillaId) return;
    setLoading(true);
    try {
      const [blocksRes, bookingsRes] = await Promise.all([
        fetch(`/api/admin/blocked-dates?villaId=${selectedVillaId}`),
        fetch(`/api/admin/bookings?villaId=${selectedVillaId}`),
      ]);

      const blocksData = await blocksRes.json();
      const bookingsData = await bookingsRes.json();

      if (blocksData.success) {
        setBlockedDates(blocksData.data || []);
      }
      if (bookingsData.success) {
        setBookings(bookingsData.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedVillaId]);

  useEffect(() => {
    let isCancelled = false;
    void (async () => {
      if (!isCancelled) {
        await fetchData();
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [fetchData]);

  // Update current time every second for hold calculations
  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError("");
    setSubmittingBlock(true);

    const finalReason =
      blockReason === "Other" && customReason.trim()
        ? customReason.trim()
        : blockReason;

    try {
      const res = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          villaId: selectedVillaId,
          startDate: blockStartDate,
          endDate: blockEndDate,
          reason: finalReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to block dates.");
      }

      setIsBlockModalOpen(false);
      setBlockStartDate("");
      setBlockEndDate("");
      setCustomReason("");
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      setBlockError(msg);
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    if (!confirm("Are you sure you want to remove this blocked date range?")) return;
    try {
      const res = await fetch(`/api/admin/blocked-dates/${blockId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to remove block.");
        return;
      }
      fetchData();
    } catch {
      alert("Network error removing block.");
    }
  };

  // Calendar Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const isDateInRange = (day: number, startStr: string, endStr: string) => {
    const target = new Date(Date.UTC(year, month, day)).getTime();
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    return target >= s && target < e;
  };

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 justify-between text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <label className="font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] text-[11px] whitespace-nowrap">
            Select Villa Residence:
          </label>
          <select
            value={selectedVillaId}
            onChange={(e) => setSelectedVillaId(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
          >
            {villas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setBlockError("");
            setIsBlockModalOpen(true);
          }}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-[#202020] hover:bg-[#171717] text-white transition-colors shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Block Dates</span>
        </button>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#E8E8E8] dark:border-[#383633] p-5 sm:p-6 space-y-5 shadow-xs">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E8E8] dark:border-[#383633] pb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#202020] dark:text-[#FCFBF8]">
              {monthName} {year}
            </h2>
            {loading && (
              <span className="text-xs text-[#66635F] dark:text-[#BDB8B0] animate-pulse">
                Fetching calendar...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F7F6F3] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#DAD7D1] dark:border-[#383633] hover:bg-[#DAD7D1]/50 dark:hover:bg-[#383633] transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F7F6F3] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#DAD7D1] dark:border-[#383633] hover:bg-[#DAD7D1]/50 dark:hover:bg-[#383633] transition-colors"
            >
              Today
            </button>

            <button
              onClick={handleNextMonth}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F7F6F3] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#DAD7D1] dark:border-[#383633] hover:bg-[#DAD7D1]/50 dark:hover:bg-[#383633] transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#202020] border border-[#DAD7D1] dark:border-[#383633]" />
            <span className="text-[#66635F] dark:text-[#BDB8B0]">Available</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9822B]" />
            <span className="text-[#66635F] dark:text-[#BDB8B0]">Pending Hold</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F7658]" />
            <span className="text-[#66635F] dark:text-[#BDB8B0]">Confirmed Stay</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A8782]" />
            <span className="text-[#66635F] dark:text-[#BDB8B0]">Blocked / Maintenance</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div
              key={dayName}
              className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0]"
            >
              {dayName}
            </div>
          ))}

          {/* Empty cells before 1st of month */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[60px] sm:h-24 rounded-lg bg-[#F7F6F3]/40 dark:bg-[#171717]/40 border border-transparent"
            />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;

            const activeBooking = bookings.find((b) => {
              if (b.status === "CANCELLED") return false;
              if (b.status === "PENDING" && b.paymentHoldExpiresAt) {
                const expires = new Date(b.paymentHoldExpiresAt).getTime();
                if (expires <= nowMs) return false; // Ignore expired pending holds
              }
              return isDateInRange(dayNum, b.checkIn, b.checkOut);
            });

            const isPendingHold = activeBooking?.status === "PENDING";

            const activeBlock = blockedDates.find((blk) =>
              isDateInRange(dayNum, blk.startDate, blk.endDate)
            );

            return (
              <div
                key={dayNum}
                className={`min-h-[60px] sm:h-24 p-1 sm:p-1.5 rounded-lg border flex flex-col justify-between transition-colors ${
                  activeBooking
                    ? isPendingHold
                      ? "bg-[#D9822B]/10 dark:bg-[#D9822B]/20 border-[#D9822B]/40 text-[#D9822B]"
                      : "bg-[#3F7658]/15 dark:bg-[#3F7658]/20 border-[#3F7658]/40 text-[#3F7658]"
                    : activeBlock
                    ? "bg-[#8A8782]/15 dark:bg-[#8A8782]/25 border-[#DAD7D1] dark:border-[#383633]"
                    : "bg-white dark:bg-[#202020] border-[#E8E8E8] dark:border-[#383633] hover:border-[#202020] dark:hover:border-[#EFA1AA]"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold font-sans">
                  <span
                    className={
                      activeBooking
                        ? isPendingHold
                          ? "text-[#D9822B]"
                          : "text-[#3F7658]"
                        : activeBlock
                        ? "text-[#66635F] dark:text-[#BDB8B0]"
                        : "text-[#202020] dark:text-[#FCFBF8]"
                    }
                  >
                    {dayNum}
                  </span>
                </div>

                <div className="space-y-1">
                  {activeBooking && (
                    <button
                      onClick={() => setSelectedBooking(activeBooking)}
                      className={`w-full text-left p-1 rounded text-white text-[10px] truncate transition-colors flex items-center gap-1 ${
                        isPendingHold
                          ? "bg-[#D9822B] hover:bg-[#c27324]"
                          : "bg-[#3F7658] hover:bg-[#346349]"
                      }`}
                      title={`${activeBooking.guestName} (${isPendingHold ? "PENDING HOLD" : activeBooking.status})`}
                    >
                      {isPendingHold ? (
                        <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                      ) : (
                        <User className="w-2.5 h-2.5 flex-shrink-0" />
                      )}
                      <span className="truncate">{activeBooking.guestName}</span>
                    </button>
                  )}

                  {activeBlock && (
                    <div
                      className="p-1 rounded bg-[#66635F] text-white text-[10px] truncate flex items-center gap-1"
                      title={`Blocked: ${activeBlock.reason || "Hold"}`}
                    >
                      <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{activeBlock.reason || "Blocked"}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Blocked Dates List */}
      <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#E8E6E2] dark:border-[#383633] p-5 space-y-4 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#202020] dark:text-[#FCFBF8]">
          Active Blocked Date Ranges
        </h3>

        {blockedDates.length === 0 ? (
          <p className="text-xs text-[#66635F] dark:text-[#BDB8B0]">
            No manual date blocks currently active for this villa residence.
          </p>
        ) : (
          <div className="divide-y divide-[#E8E6E2]/60 dark:divide-[#383633]">
            {blockedDates.map((block) => (
              <div
                key={block._id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#202020] dark:text-[#FCFBF8]">
                    {new Date(block.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} →{" "}
                    {new Date(block.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                    Reason: {block.reason || "Maintenance"}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveBlock(block._id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#B84A4A]/10 text-[#B84A4A] border border-[#B84A4A]/30 hover:bg-[#B84A4A]/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Block</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Blocked Date Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl border border-[#E8E6E2] dark:border-[#383633] p-6 space-y-5 shadow-2xl text-xs text-[#202020] dark:text-[#FCFBF8]">
            <div className="flex items-center justify-between border-b border-[#E8E6E2] dark:border-[#383633] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                Block Date Range
              </h3>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1 rounded-lg text-[#66635F] dark:text-[#BDB8B0] hover:bg-[#F7F6F3] dark:hover:bg-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {blockError && (
              <div className="p-3 rounded-lg bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-[#B84A4A] text-xs">
                {blockError}
              </div>
            )}

            <form onSubmit={handleAddBlockSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                  Start Date (Check-in) *
                </label>
                <input
                  type="date"
                  required
                  value={blockStartDate}
                  onChange={(e) => setBlockStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                  End Date (Check-out) *
                </label>
                <input
                  type="date"
                  required
                  value={blockEndDate}
                  onChange={(e) => setBlockEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                  Reason for Block
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-medium text-[#202020] dark:text-[#FCFBF8]"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Private Use">Owner Hold / Private Use</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {blockReason === "Other" && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                    Custom Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="e.g. VIP Event"
                    className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8]"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-[#E8E6E2] dark:border-[#383633] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#F7F6F3] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#DAD7D1] dark:border-[#383633]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBlock}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#202020] hover:bg-[#171717] text-white transition-colors"
                >
                  {submittingBlock ? "Saving..." : "Confirm Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl border border-[#E8E6E2] dark:border-[#383633] p-6 space-y-4 shadow-2xl text-xs text-[#202020] dark:text-[#FCFBF8]">
            <div className="flex items-center justify-between border-b border-[#E8E6E2] dark:border-[#383633] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                Booking Details
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-[#66635F] dark:text-[#BDB8B0] hover:bg-[#F7F6F3] dark:hover:bg-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] space-y-1">
                <div className="text-[#66635F] dark:text-[#BDB8B0] font-mono text-[11px]">
                  ID: #{selectedBooking._id}
                </div>
                <div className="font-bold text-sm text-[#202020] dark:text-[#FCFBF8]">
                  {selectedBooking.guestName}
                </div>
                <div className="text-[#66635F] dark:text-[#BDB8B0]">
                  {selectedBooking.guestEmail} • {selectedBooking.guestPhone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633]">
                  <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0] uppercase font-semibold">Check-In</span>
                  <div className="font-bold text-[#202020] dark:text-[#FCFBF8]">
                    {new Date(selectedBooking.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633]">
                  <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0] uppercase font-semibold">Check-Out</span>
                  <div className="font-bold text-[#202020] dark:text-[#FCFBF8]">
                    {new Date(selectedBooking.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383633]">
                <div>
                  <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0] uppercase font-semibold">Total Price</span>
                  <div className="font-sans text-lg font-bold text-[#202020] dark:text-[#FCFBF8]">
                    {formatCurrency(selectedBooking.totalAmount)}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider border ${
                    selectedBooking.status === "PENDING"
                      ? "bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/30"
                      : "bg-[#3F7658]/10 text-[#3F7658] border-[#3F7658]/30"
                  }`}
                >
                  {selectedBooking.status === "PENDING" ? "⏳ PENDING HOLD" : selectedBooking.status}
                </span>
              </div>

              {selectedBooking.status === "PENDING" && selectedBooking.paymentHoldExpiresAt && (
                <div className="p-2.5 rounded-lg bg-[#D9822B]/10 border border-[#D9822B]/30 text-[11px] space-y-0.5">
                  <div className="font-semibold text-[#D9822B]">
                    Payment Hold Expiry:
                  </div>
                  <div className="text-[#66635F] dark:text-[#BDB8B0]">
                    {new Date(selectedBooking.paymentHoldExpiresAt).toLocaleString("en-IN")} (
                    {new Date(selectedBooking.paymentHoldExpiresAt).getTime() > nowMs
                      ? "Active Hold"
                      : "Expired"}
                    )
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#202020] hover:bg-[#171717] text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
