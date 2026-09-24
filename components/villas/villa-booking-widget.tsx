"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import { Villa } from "@/types/villa";
import { useCustomerAuth } from "@/components/providers/customer-auth-provider";

interface BlockedRange {
  startDate: string;
  endDate: string;
  type: string;
}

interface ConfirmedBookingDetails {
  _id?: string;
  id?: string;
  villaId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentHoldExpiresAt?: string;
}

export interface RazorpayCallbackData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Helper to safely load official Razorpay Checkout SDK script (checkout.js)
 */
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface VillaBookingContextType {
  villa: Villa;
  villaId: string;
  currentMonthDate: Date;
  canGoPrevMonth: boolean;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  checkIn: string;
  checkOut: string;
  hoverDate: string;
  setHoverDate: (date: string) => void;
  guests: number;
  setGuests: React.Dispatch<React.SetStateAction<number>>;
  currentStep: 1 | 2;
  setCurrentStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  guestName: string;
  setGuestName: React.Dispatch<React.SetStateAction<string>>;
  guestEmail: string;
  setGuestEmail: React.Dispatch<React.SetStateAction<string>>;
  guestPhone: string;
  setGuestPhone: React.Dispatch<React.SetStateAction<string>>;
  blockedRanges: BlockedRange[];
  availabilityState: "IDLE" | "LOADING" | "AVAILABLE" | "UNAVAILABLE" | "ERROR";
  availabilityMessage: string;
  isSubmitting: boolean;
  isProcessingPayment: boolean;
  bookingError: string | null;
  setBookingError: React.Dispatch<React.SetStateAction<string | null>>;
  confirmedBooking: ConfirmedBookingDetails | null;
  razorpayCallbackData: RazorpayCallbackData | null;
  handleDateClick: (dateStr: string) => void;
  handleSubmitBooking: (e: React.FormEvent) => Promise<void>;
  handleInitiatePayment: (targetBooking?: ConfirmedBookingDetails) => Promise<void>;
  handleResetBooking: () => void;
  formatDateDisplay: (dateStr: string) => string;
  isPast: (dateStr: string) => boolean;
  isDateBlocked: (dateStr: string) => boolean;
  nights: number;
  totalPrice: number;
  clearDates: () => void;
}

const VillaBookingContext = createContext<VillaBookingContextType | null>(null);

export function useVillaBooking() {
  const ctx = useContext(VillaBookingContext);
  if (!ctx) {
    throw new Error("useVillaBooking must be used within a VillaBookingProvider");
  }
  return ctx;
}

export function VillaBookingProvider({
  villa,
  children,
}: {
  villa: Villa;
  children: React.ReactNode;
}) {
  const villaId = villa.id || (villa as unknown as { _id: string })._id;

  // Helper date functions
  const formatDateISO = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return "Select date";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const monthAbbr = MONTH_NAMES[monthIdx]?.slice(0, 3) || "";
    return `${day} ${monthAbbr} ${year}`;
  };

  const parseISO = (str: string): Date => {
    const parts = str.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateISO(today);

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Booking selections & Stepper State
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [hoverDate, setHoverDate] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const { customer, idToken } = useCustomerAuth();

  // Guest Contact Info
  const [guestName, setGuestName] = useState<string>(customer?.name || "");
  const [guestEmail, setGuestEmail] = useState<string>(customer?.email || "");
  const [guestPhone, setGuestPhone] = useState<string>(customer?.phone || "");
  const [syncedCustomerId, setSyncedCustomerId] = useState<string | undefined>(customer?.id);

  if (customer?.id && customer.id !== syncedCustomerId) {
    setSyncedCustomerId(customer.id);
    if (customer.name && !guestName) setGuestName(customer.name);
    if (customer.email && !guestEmail) setGuestEmail(customer.email);
    if (customer.phone && !guestPhone) setGuestPhone(customer.phone);
  }

  // Availability & Backend state
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [availabilityState, setAvailabilityState] = useState<
    "IDLE" | "LOADING" | "AVAILABLE" | "UNAVAILABLE" | "ERROR"
  >("IDLE");
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBookingDetails | null>(null);
  const [razorpayCallbackData, setRazorpayCallbackData] = useState<RazorpayCallbackData | null>(null);

  // Fetch blocked / booked date ranges
  useEffect(() => {
    let isCancelled = false;
    async function loadBlockedRanges() {
      try {
        const res = await fetch(`/api/villas/${villaId}/availability`);
        const data = await res.json();
        if (!isCancelled && data.success && Array.isArray(data.blockedRanges)) {
          setBlockedRanges(data.blockedRanges);
        }
      } catch (err) {
        console.error("Failed to load villa blocked ranges:", err);
      }
    }
    void loadBlockedRanges();
    return () => {
      isCancelled = true;
    };
  }, [villaId]);

  const isPast = (dateStr: string) => dateStr < todayStr;

  const isDateBlocked = useCallback(
    (dateStr: string) => {
      return blockedRanges.some((r) => dateStr >= r.startDate && dateStr < r.endDate);
    },
    [blockedRanges]
  );

  const isRangeBlocked = useCallback(
    (startStr: string, endStr: string) => {
      const curr = parseISO(startStr);
      const end = parseISO(endStr);
      while (curr < end) {
        const s = formatDateISO(curr);
        if (isDateBlocked(s)) return true;
        curr.setDate(curr.getDate() + 1);
      }
      return false;
    },
    [isDateBlocked]
  );

  const calculateNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate || outDate <= inDate) return 0;
    const start = parseISO(inDate);
    const end = parseISO(outDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = nights * villa.pricePerNight;

  const checkAvailability = useCallback(
    async (inDate: string, outDate: string) => {
      if (!inDate || !outDate) return;
      if (outDate <= inDate) {
        setAvailabilityState("ERROR");
        setAvailabilityMessage("Check-out date must be after check-in date.");
        return;
      }

      setAvailabilityState("LOADING");
      setAvailabilityMessage("");

      try {
        const res = await fetch(
          `/api/villas/${villaId}/availability?checkIn=${inDate}&checkOut=${outDate}&guests=${guests}`
        );
        const data = await res.json();

        if (!res.ok) {
          setAvailabilityState("ERROR");
          setAvailabilityMessage(data.error || "Failed to check availability.");
          return;
        }

        if (data.available) {
          setAvailabilityState("AVAILABLE");
          setAvailabilityMessage("Available for your selected dates");
        } else {
          setAvailabilityState("UNAVAILABLE");
          setAvailabilityMessage(
            data.error || "Selected dates are unavailable for booking."
          );
        }
      } catch {
        setAvailabilityState("ERROR");
        setAvailabilityMessage("Network error checking availability.");
      }
    },
    [villaId, guests, setAvailabilityState, setAvailabilityMessage]
  );

  useEffect(() => {
    let isCancelled = false;
    if (checkIn && checkOut) {
      void (async () => {
        if (!isCancelled) {
          await checkAvailability(checkIn, checkOut);
        }
      })();
    }
    return () => {
      isCancelled = true;
    };
  }, [checkIn, checkOut, checkAvailability]);

  const handleDateClick = (dateStr: string) => {
    if (isPast(dateStr) || isDateBlocked(dateStr)) return;

    setBookingError(null);

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut("");
      setAvailabilityState("IDLE");
      setCurrentStep(1);
    } else if (checkIn && !checkOut) {
      if (dateStr <= checkIn) {
        setCheckIn(dateStr);
        setCheckOut("");
        setAvailabilityState("IDLE");
      } else {
        if (isRangeBlocked(checkIn, dateStr)) {
          setBookingError("Selected date range includes unavailable dates. Please choose another checkout date.");
          setCheckIn(dateStr);
          setCheckOut("");
        } else {
          setCheckOut(dateStr);
        }
      }
    }
  };

  const firstMonthOfToday = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoPrevMonth = currentMonthDate > firstMonthOfToday;

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  const clearDates = () => {
    setCheckIn("");
    setCheckOut("");
    setAvailabilityState("IDLE");
    setAvailabilityMessage("");
    setCurrentStep(1);
    setBookingError(null);
  };

  /**
   * Launch Razorpay Standard Checkout Popup for a booking document
   */
  const handleInitiatePayment = async (targetBooking?: ConfirmedBookingDetails) => {
    const bookingToUse = targetBooking || confirmedBooking;
    const bookingId = bookingToUse?._id || bookingToUse?.id;

    if (!bookingId) {
      setBookingError("Booking reference not found. Please try again.");
      return;
    }

    setBookingError(null);
    setIsProcessingPayment(true);

    try {
      // 1. Ensure Razorpay Checkout script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setBookingError("Unable to open payment SDK. Please check your network connection.");
        setIsProcessingPayment(false);
        setIsSubmitting(false);
        return;
      }

      // 2. Request Razorpay Order Creation from backend
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ bookingId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success || !orderData.order) {
        setBookingError(orderData.error || "Unable to start payment. Please try again.");
        setIsProcessingPayment(false);
        setIsSubmitting(false);
        return;
      }

      const { order, keyId } = orderData;

      // 3. Initialize Razorpay Checkout Options
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Daranga Villa",
        description: `Stay reservation for ${villa.name}`,
        order_id: order.id,
        prefill: {
          name: guestName.trim() || bookingToUse?.guestName || "",
          email: guestEmail.trim() || bookingToUse?.guestEmail || "",
          contact: guestPhone.trim() || bookingToUse?.guestPhone || "",
        },
        theme: {
          color: "#C5A880", // Luxury champagne gold theme matching Daranga Villa visual design
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsProcessingPayment(true);
          setBookingError(null);

          try {
            // STEP 3: Server-side Payment Signature & Amount Verification
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
              },
              body: JSON.stringify({
                bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              setBookingError(verifyData.error || "Payment could not be verified. Your booking is still pending.");
              setIsProcessingPayment(false);
              setIsSubmitting(false);
              return;
            }

            // Signature & Payment Verification Succeeded! Update state to CONFIRMED / PAID
            setRazorpayCallbackData({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.booking) {
              setConfirmedBooking(verifyData.booking);
            } else {
              setConfirmedBooking((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "CONFIRMED",
                      paymentStatus: "PAID",
                      razorpayOrderId: response.razorpay_order_id,
                      razorpayPaymentId: response.razorpay_payment_id,
                    }
                  : prev
              );
            }
          } catch {
            setBookingError("Payment could not be verified due to a network error. Your booking is still pending.");
          } finally {
            setIsProcessingPayment(false);
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setBookingError("Payment was cancelled. Your booking is still pending.");
            setIsProcessingPayment(false);
            setIsSubmitting(false);
          },
        },
      };

      const razorpayInstance = new (window as unknown as {
        Razorpay: new (opts: typeof options) => {
          on: (event: string, fn: (err: { error?: { description?: string } }) => void) => void;
          open: () => void;
        };
      }).Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        const failureReason =
          response?.error?.description || "Payment failed or was declined. Please try again.";
        setBookingError(failureReason);
        setIsProcessingPayment(false);
        setIsSubmitting(false);
      });

      razorpayInstance.open();
    } catch {
      setBookingError("A network error occurred while launching payment.");
      setIsProcessingPayment(false);
      setIsSubmitting(false);
    }
  };

  /**
   * Submit Booking Form (Step 2 Submit) -> Creates MongoDB Booking & Initiates Razorpay Payment
   */
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!checkIn || !checkOut) {
      setBookingError("Please select both check-in and check-out dates on the calendar.");
      return;
    }

    if (nights <= 0) {
      setBookingError("Check-out date must be after check-in date.");
      return;
    }

    if (availabilityState === "UNAVAILABLE") {
      setBookingError("Villa is unavailable for the selected dates.");
      return;
    }

    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setBookingError("Please fill out all contact information fields.");
      return;
    }

    setIsSubmitting(true);

    // If booking document already created for this session, reuse it
    if (confirmedBooking && (confirmedBooking._id || confirmedBooking.id)) {
      await handleInitiatePayment(confirmedBooking);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          villaId,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          checkIn,
          checkOut,
          guests,
          customerId: customer?.id || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingError(data.error || "Failed to create booking.");
        if (res.status === 409) {
          setAvailabilityState("UNAVAILABLE");
          setAvailabilityMessage("These dates were just booked by another guest.");
        }
        setIsSubmitting(false);
        return;
      }

      const createdBooking: ConfirmedBookingDetails = data.data || data.booking;
      setConfirmedBooking(createdBooking);

      // Launch Razorpay Order Creation & Checkout Modal
      await handleInitiatePayment(createdBooking);
    } catch {
      setBookingError("A network error occurred while submitting your booking.");
      setIsSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setConfirmedBooking(null);
    setRazorpayCallbackData(null);
    clearDates();
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
  };

  return (
    <VillaBookingContext.Provider
      value={{
        villa,
        villaId,
        currentMonthDate,
        canGoPrevMonth,
        handlePrevMonth,
        handleNextMonth,
        checkIn,
        checkOut,
        hoverDate,
        setHoverDate,
        guests,
        setGuests,
        currentStep,
        setCurrentStep,
        guestName,
        setGuestName,
        guestEmail,
        setGuestEmail,
        guestPhone,
        setGuestPhone,
        blockedRanges,
        availabilityState,
        availabilityMessage,
        isSubmitting,
        isProcessingPayment,
        bookingError,
        setBookingError,
        confirmedBooking,
        razorpayCallbackData,
        handleDateClick,
        handleSubmitBooking,
        handleInitiatePayment,
        handleResetBooking,
        formatDateDisplay,
        isPast,
        isDateBlocked,
        nights,
        totalPrice,
        clearDates,
      }}
    >
      {children}
    </VillaBookingContext.Provider>
  );
}

/**
 * 2-MONTH DESKTOP / 1-MONTH MOBILE CALENDAR COMPONENT
 */
export function VillaCalendar() {
  const {
    villa,
    currentMonthDate,
    canGoPrevMonth,
    handlePrevMonth,
    handleNextMonth,
    checkIn,
    checkOut,
    hoverDate,
    setHoverDate,
    handleDateClick,
    formatDateDisplay,
    isPast,
    isDateBlocked,
    nights,
    clearDates,
    guests,
    setGuests,
  } = useVillaBooking();

  const formatDateISO = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const month0Date = currentMonthDate;
  const month1Date = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth() + 1,
    1
  );
  const month2Date = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth() + 2,
    1
  );

  const getCalendarMonthGrid = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ dayNum: number; dateStr: string } | null> = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      days.push({ dayNum: day, dateStr: formatDateISO(d) });
    }

    return {
      year,
      month,
      monthName: MONTH_NAMES[month],
      days,
    };
  };

  const month0Grid = getCalendarMonthGrid(month0Date);
  const month1Grid = getCalendarMonthGrid(month1Date);
  const month2Grid = getCalendarMonthGrid(month2Date);

  const renderSingleMonth = (
    grid: ReturnType<typeof getCalendarMonthGrid>,
    showPrevArrow: boolean,
    showNextArrow: boolean,
    showNextOnMobile: boolean = false
  ) => {
    return (
      <div className="w-full min-w-0 space-y-3">
        {/* Month Header */}
        <div className="flex items-center justify-between w-full min-w-0 pb-2 border-b border-[var(--border-color)]/40">
          {showPrevArrow ? (
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrevMonth}
              className="w-8 h-8 rounded-full border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center text-xs font-bold disabled:opacity-20 disabled:pointer-events-none flex-shrink-0"
              aria-label="Previous Month"
            >
              &larr;
            </button>
          ) : (
            <div className="w-8 flex-shrink-0" />
          )}

          <h4 className="font-serif text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-wide uppercase whitespace-nowrap truncate px-1 text-center flex-1 min-w-0">
            {grid.monthName} {grid.year}
          </h4>

          {showNextArrow ? (
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center text-xs font-bold flex-shrink-0"
              aria-label="Next Month"
            >
              &rarr;
            </button>
          ) : showNextOnMobile ? (
            <button
              type="button"
              onClick={handleNextMonth}
              className="md:hidden w-8 h-8 rounded-full border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center text-xs font-bold flex-shrink-0"
              aria-label="Next Month"
            >
              &rarr;
            </button>
          ) : (
            <div className="w-8 flex-shrink-0" />
          )}
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center w-full min-w-0 border-b border-[var(--border-color)]/50 pb-2">
          {DAY_NAMES.map((d) => (
            <span
              key={d}
              className="w-full min-w-0 text-center text-[9px] min-[360px]:text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-normal truncate"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 text-center w-full min-w-0 gap-y-1">
          {grid.days.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-9 min-[380px]:h-10 sm:h-11 w-full min-w-0" />;
            }

            const { dayNum, dateStr } = cell;
            const past = isPast(dateStr);
            const blocked = isDateBlocked(dateStr);
            const isDisabled = past || blocked;

            const isCheckIn = checkIn === dateStr;
            const isCheckOut = checkOut === dateStr;
            const inSelectedRange =
              checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
            const inHoverRange =
              checkIn &&
              !checkOut &&
              hoverDate &&
              hoverDate > checkIn &&
              dateStr > checkIn &&
              dateStr < hoverDate;

            let containerBg = "";
            if (checkOut && checkIn) {
              if (isCheckIn) containerBg = "bg-[var(--accent)]/20 rounded-l-full";
              else if (isCheckOut) containerBg = "bg-[var(--accent)]/20 rounded-r-full";
              else if (inSelectedRange) containerBg = "bg-[var(--accent)]/20";
            } else if (checkIn && !checkOut && hoverDate && hoverDate > checkIn) {
              if (isCheckIn) containerBg = "bg-[var(--accent)]/12 rounded-l-full";
              else if (dateStr === hoverDate) containerBg = "bg-[var(--accent)]/12 rounded-r-full";
              else if (inHoverRange) containerBg = "bg-[var(--accent)]/12";
            }

            let btnStyle =
              "text-[var(--text-primary)] hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] rounded-full font-medium";

            if (isDisabled) {
              btnStyle =
                "text-[var(--text-secondary)]/35 line-through cursor-not-allowed pointer-events-none";
            } else if (isCheckIn || isCheckOut) {
              btnStyle =
                "bg-[var(--accent)] text-[var(--accent-text)] font-bold rounded-full shadow-md z-10";
            }

            const ariaLabel = `${grid.monthName} ${dayNum}, ${grid.year}${
              isDisabled
                ? ", unavailable"
                : isCheckIn
                ? ", check-in"
                : isCheckOut
                ? ", check-out"
                : ", available"
            }`;

            return (
              <div
                key={dateStr}
                className={`h-9 min-[380px]:h-10 sm:h-11 w-full min-w-0 flex items-center justify-center relative ${containerBg}`}
              >
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateClick(dateStr)}
                  onMouseEnter={() => {
                    if (checkIn && !checkOut) setHoverDate(dateStr);
                  }}
                  onMouseLeave={() => {
                    if (checkIn && !checkOut) setHoverDate("");
                  }}
                  aria-label={ariaLabel}
                  className={`w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-9 sm:h-9 max-w-full flex flex-col items-center justify-center text-[11px] min-[380px]:text-xs sm:text-sm transition-all relative ${btnStyle}`}
                >
                  <span>{dayNum}</span>
                  {isCheckIn && (
                    <span className="text-[7px] font-bold tracking-tighter uppercase leading-none block -mt-0.5">
                      IN
                    </span>
                  )}
                  {isCheckOut && (
                    <span className="text-[7px] font-bold tracking-tighter uppercase leading-none block -mt-0.5">
                      OUT
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="booking-widget" className="w-full min-w-0 bg-[var(--bg-secondary)] p-3.5 sm:p-6 md:p-8 border border-[var(--border-color)] rounded-[12px] shadow-xl text-[var(--text-primary)] space-y-5">
      {/* Calendar Grid */}
      <div className="space-y-4 w-full min-w-0">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-sans uppercase tracking-[0.15em] text-[var(--accent)] font-semibold truncate">
            {checkIn && !checkOut
              ? "Select check-out date"
              : checkIn && checkOut
              ? "Selected stay dates"
              : "Select check-in date"}
          </span>
          {checkIn && (
            <button
              type="button"
              onClick={clearDates}
              className="text-[10px] text-[var(--accent)] underline hover:opacity-80 uppercase tracking-wider flex-shrink-0 ml-2"
            >
              Clear dates
            </button>
          )}
        </div>

        <div className="bg-[var(--bg-primary)] p-3 sm:p-5 md:p-6 rounded-[8px] border border-[var(--border-color)]/80 w-full min-w-0">
          {/* Mobile Single Month View (< md) */}
          <div className="block md:hidden w-full min-w-0">
            {renderSingleMonth(month0Grid, true, true, true)}
          </div>

          {/* Desktop Multi-Month Horizontally Scrollable Calendar Container (md+) */}
          <div className="hidden md:block w-full min-w-0 overflow-x-auto">
            <div className="flex flex-row items-start gap-6 lg:gap-8 min-w-max pb-2">
              <div className="w-[290px] lg:w-[310px] xl:w-[330px] flex-shrink-0">
                {renderSingleMonth(month0Grid, true, false)}
              </div>
              <div className="w-[290px] lg:w-[310px] xl:w-[330px] flex-shrink-0 border-l border-[var(--border-color)]/50 pl-6 lg:pl-8">
                {renderSingleMonth(month1Grid, false, false)}
              </div>
              <div className="w-[290px] lg:w-[310px] xl:w-[330px] flex-shrink-0 border-l border-[var(--border-color)]/50 pl-6 lg:pl-8">
                {renderSingleMonth(month2Grid, false, true)}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--text-secondary)] pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)]/40" />
            <span className="line-through">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Date Range Strip */}
      <div className="grid grid-cols-3 gap-2 py-4 border-y border-[var(--border-color)]/60 text-center">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-semibold block">CHECK-IN</span>
          <span className="text-xs font-semibold text-[var(--text-primary)] block truncate mt-0.5">
            {checkIn ? formatDateDisplay(checkIn) : "Select date"}
          </span>
        </div>
        <div className="border-x border-[var(--border-color)]/60 px-1">
          <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-semibold block">CHECK-OUT</span>
          <span className="text-xs font-semibold text-[var(--text-primary)] block truncate mt-0.5">
            {checkOut ? formatDateDisplay(checkOut) : "Select date"}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-semibold block">STAY</span>
          <span className="text-xs font-semibold text-[var(--text-primary)] block mt-0.5">
            {nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "--"}
          </span>
        </div>
      </div>

      {/* Number of Guests Selector */}
      <div className="flex items-center justify-between p-4 sm:p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[8px]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--accent)] block">
            NUMBER OF GUESTS
          </span>
          <span className="text-xs text-[var(--text-secondary)] font-light block mt-0.5">
            Max occupancy: {villa.maxGuests || 4} guests
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            disabled={guests <= 1}
            aria-label="Decrease guests"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            -
          </button>
          <span className="font-serif text-base sm:text-lg font-bold text-[var(--text-primary)] w-6 text-center">
            {guests}
          </span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(villa.maxGuests || 4, g + 1))}
            disabled={guests >= (villa.maxGuests || 4)}
            aria-label="Increase guests"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 2-STEP LUXURY RESERVATION CARD COMPONENT (STEP 1 & STEP 2 + CONFIRMATION VIEW)
 */
export function VillaBookingCard() {
  const {
    villa,
    checkIn,
    checkOut,
    guests,
    currentStep,
    setCurrentStep,
    guestName,
    setGuestName,
    guestEmail,
    setGuestEmail,
    guestPhone,
    setGuestPhone,
    availabilityState,
    availabilityMessage,
    isSubmitting,
    isProcessingPayment,
    bookingError,
    setBookingError,
    confirmedBooking,
    handleSubmitBooking,
    handleInitiatePayment,
    handleResetBooking,
    formatDateDisplay,
    nights,
    totalPrice,
  } = useVillaBooking();

  // State for live countdown timer
  // Initialize current time lazily; the authoritative expiry comes from booking.paymentHoldExpiresAt
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Update nowMs every second when a pending booking with a hold exists
  useEffect(() => {
    if (!confirmedBooking || confirmedBooking.status !== "PENDING" || !confirmedBooking.paymentHoldExpiresAt) {
      return;
    }
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [confirmedBooking]);

  // CONFIRMATION VIEW (Renders when booking is created/confirmed)
  if (confirmedBooking) {
    const isPaidAndConfirmed =
      confirmedBooking.paymentStatus === "PAID" || confirmedBooking.status === "CONFIRMED";

    const holdExpiresMs = confirmedBooking.paymentHoldExpiresAt
      ? new Date(confirmedBooking.paymentHoldExpiresAt).getTime()
      : 0;

    const remainingMs = Math.max(0, holdExpiresMs - nowMs);
    const isHoldExpired = Boolean(
      !isPaidAndConfirmed &&
        confirmedBooking.status === "PENDING" &&
        confirmedBooking.paymentHoldExpiresAt &&
        remainingMs <= 0
    );

    const remainingSecondsTotal = Math.floor(remainingMs / 1000);
    const remainingMinutes = Math.floor(remainingSecondsTotal / 60);
    const remainingSeconds = remainingSecondsTotal % 60;
    const formattedTimer = `${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

    return (
      <div className="bg-[var(--bg-secondary)] p-6 sm:p-8 rounded-[12px] border border-[var(--border-color)] shadow-xl space-y-6 animate-in fade-in duration-300 text-[var(--text-primary)]">
        <div className="text-center space-y-3 pb-4 border-b border-[var(--border-color)]">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border ${
              isPaidAndConfirmed
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                : isHoldExpired
                ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                : "bg-amber-500/10 text-amber-500 border-amber-500/30"
            }`}
          >
            {isPaidAndConfirmed ? (
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : isHoldExpired ? (
              <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] block ${
              isPaidAndConfirmed
                ? "text-emerald-500"
                : isHoldExpired
                ? "text-rose-500"
                : "text-amber-500"
            }`}
          >
            {isPaidAndConfirmed
              ? "BOOKING CONFIRMED"
              : isHoldExpired
              ? "HOLD EXPIRED"
              : "RESERVATION PENDING"}
          </span>

          <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
            {isPaidAndConfirmed
              ? "Your Stay is Confirmed!"
              : isHoldExpired
              ? "Payment Window Expired"
              : "Booking Request Pending Payment"}
          </h3>

          <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
            {isPaidAndConfirmed
              ? `Your reservation at ${villa.name} has been verified and fully confirmed.`
              : isHoldExpired
              ? "Your 15-minute temporary hold on these dates has expired. Please select your dates again."
              : "Your booking request is created. Complete payment to finalize your sanctuary reservation."}
          </p>

          {!isPaidAndConfirmed && !isHoldExpired && confirmedBooking.paymentHoldExpiresAt && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-500">
                ⏳ Dates held for {formattedTimer}
              </span>
            </div>
          )}
        </div>

        {/* Inline Error Display */}
        {bookingError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-[6px] text-xs text-rose-500 font-medium animate-in fade-in duration-200">
            {bookingError}
          </div>
        )}

        <div className="bg-[var(--bg-primary)] p-4 rounded-[8px] border border-[var(--border-color)] space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]/60">
            <span className="text-[var(--text-secondary)] text-[10px] font-semibold uppercase tracking-wider">Booking Reference</span>
            <span className="font-mono font-semibold text-[var(--text-primary)] text-xs">
              #{(confirmedBooking._id || confirmedBooking.id || "").slice(-8).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Residence</span>
            <span className="font-semibold text-[var(--text-primary)]">{villa.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Dates</span>
            <span className="font-medium text-[var(--text-primary)]">
              {formatDateDisplay(confirmedBooking.checkIn?.split("T")[0])} &rarr; {formatDateDisplay(confirmedBooking.checkOut?.split("T")[0])}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Guests</span>
            <span className="font-medium text-[var(--text-primary)]">{confirmedBooking.guests} Guests</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]/60">
            <span className="text-[var(--text-secondary)]">Total Amount</span>
            <span className="font-sans text-base font-bold text-[var(--accent)]">
              ₹{confirmedBooking.totalAmount?.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]/60">
            <span className="text-[var(--text-secondary)] text-[10px]">Payment Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isPaidAndConfirmed
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : isHoldExpired
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/30"
              }`}
            >
              {isPaidAndConfirmed ? "PAID" : isHoldExpired ? "EXPIRED" : "UNPAID"}
            </span>
          </div>
        </div>

        {/* CTA Actions */}
        {isPaidAndConfirmed ? (
          <div className="space-y-3 pt-2">
            <Link
              href={`/account/bookings/${confirmedBooking._id || confirmedBooking.id}`}
              className="w-full py-3.5 bg-[var(--accent)] text-[var(--accent-text)] text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span>VIEW FULL BOOKING CONFIRMATION</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/account/bookings"
              className="w-full py-3 bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] text-[10px] uppercase tracking-[0.2em] font-semibold rounded-[6px] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all flex items-center justify-center"
            >
              View All My Bookings
            </Link>
            <button
              type="button"
              onClick={handleResetBooking}
              className="w-full py-2.5 text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.18em] font-semibold hover:text-[var(--text-primary)] transition-all"
            >
              Make Another Reservation
            </button>
          </div>
        ) : isHoldExpired ? (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleResetBooking}
              className="w-full py-3.5 bg-[var(--accent)] text-[var(--accent-text)] text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span>SELECT DATES AGAIN</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => handleInitiatePayment(confirmedBooking)}
              disabled={isProcessingPayment || isSubmitting}
              className="w-full py-4 bg-[var(--accent)] text-[var(--accent-text)] text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>VERIFYING PAYMENT...</span>
                </>
              ) : (
                `PAY NOW ₹${confirmedBooking.totalAmount?.toLocaleString("en-IN")}`
              )}
            </button>

            <button
              type="button"
              onClick={handleResetBooking}
              className="w-full py-3 bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] text-[10px] uppercase tracking-[0.2em] font-semibold rounded-[6px] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
            >
              Make Another Reservation
            </button>
          </div>
        )}
      </div>
    );
  }

  const isBookingReady = Boolean(
    checkIn &&
      checkOut &&
      nights > 0 &&
      availabilityState === "AVAILABLE" &&
      guests >= 1 &&
      guests <= (villa.maxGuests || 4)
  );

  return (
    <div className="bg-[var(--bg-secondary)] p-4 sm:p-7 rounded-[12px] border border-[var(--border-color)] shadow-xl space-y-6 text-[var(--text-primary)]">
      {/* Stepper Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] text-xs font-semibold uppercase tracking-[0.2em]">
        {/* Step 01 */}
        <button
          type="button"
          onClick={() => currentStep === 2 && setCurrentStep(1)}
          className={`flex items-center gap-2 transition-colors ${
            currentStep === 1
              ? "text-[var(--accent)] font-bold"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center border transition-all ${
              currentStep === 1
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold"
                : checkIn && checkOut
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold"
                : "border-[var(--border-color)] text-[var(--text-secondary)]"
            }`}
          >
            {checkIn && checkOut && currentStep === 2 ? "✓" : "01"}
          </span>
          <span>DATES</span>
        </button>

        <span className="text-[var(--border-color)]">—</span>

        {/* Step 02 */}
        <div
          className={`flex items-center gap-2 transition-colors ${
            currentStep === 2
              ? "text-[var(--accent)] font-bold"
              : "text-[var(--text-secondary)]/50"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center border transition-all ${
              currentStep === 2
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold"
                : "border-[var(--border-color)]/50 text-[var(--text-secondary)]/50"
            }`}
          >
            02
          </span>
          <span>DETAILS</span>
        </div>
      </div>

      {/* STEP 1 VIEW */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Pricing Header */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-semibold block">
              {nights > 0 ? "ESTIMATED TOTAL" : "STARTING FROM"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                ₹{(nights > 0 ? totalPrice : villa.pricePerNight).toLocaleString("en-IN")}
              </span>
              <span className="font-sans text-xs text-[var(--text-secondary)] font-normal">
                {nights > 0 ? `for ${nights} ${nights === 1 ? "night" : "nights"}` : "/ night"}
              </span>
            </div>
          </div>

          {/* Selected Dates Display */}
          <div className="p-3.5 bg-[var(--bg-primary)] rounded-[8px] border border-[var(--border-color)] grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                CHECK-IN
              </span>
              <span className="font-medium text-[var(--text-primary)] block mt-0.5 truncate">
                {checkIn ? formatDateDisplay(checkIn) : "Select date"}
              </span>
            </div>
            <div className="border-l border-[var(--border-color)] pl-3">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                CHECK-OUT
              </span>
              <span className="font-medium text-[var(--text-primary)] block mt-0.5 truncate">
                {checkOut ? formatDateDisplay(checkOut) : "Select date"}
              </span>
            </div>
          </div>

          {/* Availability Status Message */}
          {checkIn && checkOut && availabilityState !== "IDLE" && (
            <div className="text-center py-1">
              {availabilityState === "LOADING" && (
                <span className="text-xs text-[var(--accent)] font-medium animate-pulse">
                  Checking availability...
                </span>
              )}
              {availabilityState === "AVAILABLE" && (
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                  ✓ AVAILABLE FOR YOUR DATES
                </span>
              )}
              {availabilityState === "UNAVAILABLE" && (
                <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
                  {availabilityMessage || "THESE DATES ARE NOT AVAILABLE"}
                </span>
              )}
              {availabilityState === "ERROR" && (
                <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30 inline-block">
                  {availabilityMessage}
                </span>
              )}
            </div>
          )}

          {/* Price Summary Breakdown */}
          {checkIn && checkOut && nights > 0 && (
            <div className="space-y-2 pt-1 text-xs border-t border-[var(--border-color)]/70">
              <div className="flex justify-between text-[var(--text-secondary)] font-light">
                <span>
                  ₹{villa.pricePerNight.toLocaleString("en-IN")} × {nights}{" "}
                  {nights === 1 ? "night" : "nights"}
                </span>
                <span className="text-[var(--text-primary)] font-medium">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-color)] text-sm">
                <span>Total Price</span>
                <span className="text-[var(--accent)]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Step 1 Dynamic CTA */}
          {/* Requirement 4: Hide upper BOOK NOW on mobile when dates are selected, so only the sticky mobile CTA is visible */}
          <button
            type="button"
            onClick={() => {
              if (isBookingReady) {
                setCurrentStep(2);
                setBookingError(null);
              } else if (!checkIn || !checkOut) {
                const el = document.getElementById("select-dates");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            disabled={
              Boolean(checkIn && checkOut) &&
              (nights <= 0 || availabilityState === "UNAVAILABLE" || availabilityState === "LOADING")
            }
            className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] shadow-lg transition-all duration-200 ${
              isBookingReady
                ? "hidden lg:flex items-center justify-center bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-95 cursor-pointer"
                : "flex items-center justify-center bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] opacity-70 cursor-pointer"
            }`}
          >
            {isBookingReady ? "BOOK NOW" : "SELECT DATES & RESERVE"}
          </button>
        </div>
      )}

      {/* STEP 2 VIEW */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmitBooking} className="space-y-6 animate-in fade-in duration-200">
          {/* YOUR STAY Box */}
          <div className="p-4 bg-[var(--bg-primary)] rounded-[8px] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)]/60 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                YOUR STAY
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-[10px] uppercase font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                <span>Edit dates</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block">
                  Check-in
                </span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 block truncate">
                  {formatDateDisplay(checkIn)}
                </span>
              </div>
              <div className="border-x border-[var(--border-color)]/60 px-2">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block">
                  Check-out
                </span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 block truncate">
                  {formatDateDisplay(checkOut)}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block">
                  Guests
                </span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">
                  {guests} {guests === 1 ? "Guest" : "Guests"}
                </span>
              </div>
            </div>
          </div>

          {/* GUEST DETAILS Inputs */}
          <div className="space-y-3 pt-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent)] block">
              GUEST DETAILS
            </span>

            <div>
              <label
                htmlFor="guestName"
                className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block mb-1"
              >
                Full Name *
              </label>
              <input
                id="guestName"
                type="text"
                required
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  if (bookingError) setBookingError(null);
                }}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[6px] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="guestEmail"
                className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block mb-1"
              >
                Email Address *
              </label>
              <input
                id="guestEmail"
                type="email"
                required
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value);
                  if (bookingError) setBookingError(null);
                }}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[6px] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="guestPhone"
                className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] block mb-1"
              >
                Phone Number *
              </label>
              <input
                id="guestPhone"
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => {
                  setGuestPhone(e.target.value);
                  if (bookingError) setBookingError(null);
                }}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[6px] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* PRICE SUMMARY Box */}
          <div className="p-4 bg-[var(--bg-primary)] rounded-[8px] border border-[var(--border-color)] space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] block border-b border-[var(--border-color)]/60 pb-2">
              PRICE SUMMARY
            </span>

            <div className="flex justify-between text-[var(--text-secondary)] font-light pt-1">
              <span>
                ₹{villa.pricePerNight.toLocaleString("en-IN")} × {nights}{" "}
                {nights === 1 ? "night" : "nights"}
              </span>
              <span className="text-[var(--text-primary)] font-medium">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-color)] text-sm">
              <span>Total Price</span>
              <span className="text-[var(--accent)]">₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Inline Error Display */}
          {bookingError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-[6px] text-xs text-rose-500 font-medium animate-in fade-in duration-200">
              {bookingError}
            </div>
          )}

          {/* Step 2 CTA: visible on desktop right sidebar, hidden on mobile so only the bottom sticky bar CTA is shown */}
          <button
            id="step2-submit-btn"
            type="submit"
            disabled={isSubmitting || isProcessingPayment}
            className="hidden lg:flex w-full py-4 bg-[var(--accent)] text-[var(--accent-text)] text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 items-center justify-center gap-2"
          >
            {isSubmitting || isProcessingPayment ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>CREATING PAYMENT...</span>
              </>
            ) : (
              "CONTINUE TO PAYMENT"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * STICKY BOTTOM MOBILE CTA (Visible only on < lg screens)
 */
export function MobileStickyBookingBar() {
  const {
    villa,
    checkIn,
    checkOut,
    nights,
    totalPrice,
    guests,
    availabilityState,
    availabilityMessage,
    currentStep,
    setCurrentStep,
    setBookingError,
    confirmedBooking,
  } = useVillaBooking();

  // If booking is already created or confirmed/expired, hide sticky bar
  if (confirmedBooking) return null;

  const isValidDates = Boolean(checkIn && checkOut && nights > 0);
  const isAvailable = availabilityState === "AVAILABLE";
  const isValidGuests = guests >= 1 && guests <= (villa.maxGuests || 4);
  const isBookingReady = isValidDates && isAvailable && isValidGuests;

  const handleCtaClick = () => {
    if (isBookingReady) {
      if (currentStep === 1) {
        setCurrentStep(2);
        setBookingError(null);
        // Smooth scroll to guest details inputs
        const target =
          document.getElementById("guestName") ||
          document.getElementById("mobile-booking-card");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          const inputEl = document.getElementById("guestName");
          if (inputEl) inputEl.focus();
        }
      } else {
        // In step 2, trigger form submission directly
        const submitBtn = document.getElementById("step2-submit-btn");
        if (submitBtn) {
          submitBtn.click();
        }
      }
    } else {
      // Guide user to select dates on the calendar
      const el = document.getElementById("select-dates");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      className="lg:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 bg-[var(--bg-secondary)]/98 border-t border-[var(--border-color)] px-4 py-2.5 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Left Side: Price & Night Calculation */}
        <div className="min-w-0 flex-1">
          {isBookingReady ? (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="font-sans text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-light">total</span>
              </div>
              <span className="text-[11px] font-medium text-[var(--accent)] tracking-wider block">
                {nights} {nights === 1 ? "night" : "nights"} • {guests} {guests === 1 ? "guest" : "guests"}
              </span>
            </div>
          ) : isValidDates && availabilityState === "LOADING" ? (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="font-sans text-lg font-bold text-[var(--text-primary)]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <span className="text-[10px] text-[var(--accent)] font-medium animate-pulse block">
                Checking availability...
              </span>
            </div>
          ) : isValidDates && availabilityState === "UNAVAILABLE" ? (
            <div className="space-y-0.5">
              <span className="font-sans text-base font-bold text-[var(--text-secondary)] line-through">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-amber-500 font-semibold block truncate">
                {availabilityMessage || "Dates unavailable"}
              </span>
            </div>
          ) : isValidDates && availabilityState === "ERROR" ? (
            <div className="space-y-0.5">
              <span className="font-sans text-base font-bold text-[var(--text-primary)]">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-rose-500 font-semibold block">
                {availabilityMessage || "Unavailable"}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[9px] text-[var(--accent-muted)] uppercase tracking-widest block font-medium">
                Starting from
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-sans text-xl font-bold text-[var(--text-primary)]">
                  ₹{villa.pricePerNight.toLocaleString("en-IN")}
                </span>
                <span className="font-sans text-[10px] text-[var(--text-secondary)] font-normal">/ night</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: CTA Button */}
        <button
          type="button"
          onClick={handleCtaClick}
          disabled={
            isValidDates &&
            (availabilityState === "LOADING" ||
              availabilityState === "UNAVAILABLE" ||
              availabilityState === "ERROR")
          }
          className={`px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-bold rounded-[6px] shadow-lg transition-all flex-shrink-0 flex items-center justify-center ${
            isBookingReady
              ? "bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90 active:scale-[0.98] cursor-pointer"
              : isValidDates && (availabilityState === "UNAVAILABLE" || availabilityState === "ERROR")
              ? "bg-[var(--bg-surface)] text-[var(--text-secondary)]/50 border border-[var(--border-color)] opacity-60 cursor-not-allowed"
              : isValidDates && availabilityState === "LOADING"
              ? "bg-[var(--bg-surface)] text-[var(--accent)] border border-[var(--border-color)] opacity-70 cursor-wait"
              : "bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90 active:scale-[0.98] cursor-pointer"
          }`}
        >
          {isBookingReady
            ? currentStep === 2
              ? "CONTINUE TO PAYMENT"
              : "BOOK NOW"
            : isValidDates && availabilityState === "LOADING"
            ? "CHECKING..."
            : isValidDates && (availabilityState === "UNAVAILABLE" || availabilityState === "ERROR")
            ? "UNAVAILABLE"
            : "SELECT DATES"}
        </button>
      </div>
    </div>
  );
}

/**
 * Main Composite Booking Widget wrapper
 */
export function VillaBookingWidget({ villa }: { villa: Villa }) {
  return (
    <VillaBookingProvider villa={villa}>
      <div className="w-full space-y-8">
        <VillaCalendar />
        <div id="mobile-booking-card" className="lg:hidden scroll-mt-24">
          <VillaBookingCard />
        </div>
      </div>
      <MobileStickyBookingBar />
    </VillaBookingProvider>
  );
}

