"use client";

import React, { useState, useEffect, useRef } from "react";

interface LuxuryDatePickerProps {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  onSelectDates: (checkIn: string, checkOut: string) => void;
  onClose: () => void;
  unavailableDates?: string[]; // YYYY-MM-DD strings
}

export function LuxuryDatePicker({
  checkIn,
  checkOut,
  onSelectDates,
  onClose,
  unavailableDates = [],
}: LuxuryDatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial dates or default to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialCheckInDate = checkIn ? new Date(checkIn) : null;
  if (initialCheckInDate) initialCheckInDate.setHours(0, 0, 0, 0);

  const initialCheckOutDate = checkOut ? new Date(checkOut) : null;
  if (initialCheckOutDate) initialCheckOutDate.setHours(0, 0, 0, 0);

  // Month navigation state (0-indexed month)
  const baseMonthDate = initialCheckInDate || today;
  const [currentYear, setCurrentYear] = useState<number>(baseMonthDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(baseMonthDate.getMonth());

  // Track props to sync state during render if parent props update
  const [prevCheckIn, setPrevCheckIn] = useState<string>(checkIn);
  const [prevCheckOut, setPrevCheckOut] = useState<string>(checkOut);
  const [tempCheckIn, setTempCheckIn] = useState<string>(checkIn);
  const [tempCheckOut, setTempCheckOut] = useState<string>(checkOut);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  if (checkIn !== prevCheckIn || checkOut !== prevCheckOut) {
    setPrevCheckIn(checkIn);
    setPrevCheckOut(checkOut);
    setTempCheckIn(checkIn);
    setTempCheckOut(checkOut);
  }

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const formatISO = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const formatShortDate = (isoStr: string) => {
    if (!isoStr) return "";
    const d = new Date(isoStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  // Handle clicking on a calendar day
  const handleDayClick = (dateStr: string) => {
    if (!tempCheckIn || (tempCheckIn && tempCheckOut)) {
      // First click or resetting range: Set Check-In
      setTempCheckIn(dateStr);
      setTempCheckOut("");
    } else if (tempCheckIn && !tempCheckOut) {
      if (dateStr <= tempCheckIn) {
        // Clicked date is before or same as check-in: reset check-in to this date
        setTempCheckIn(dateStr);
        setTempCheckOut("");
      } else {
        // Second click: Set Check-Out and apply selection
        setTempCheckOut(dateStr);
        onSelectDates(tempCheckIn, dateStr);
      }
    }
  };

  const handleClear = () => {
    setTempCheckIn("");
    setTempCheckOut("");
    onSelectDates("", "");
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Helper to render a single month grid
  const renderMonthGrid = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }

    return (
      <div className="space-y-3">
        <div className="text-center font-serif text-sm font-semibold text-[var(--text-primary)]">
          {monthNames[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayNames.map((d, i) => (
            <div key={i} className="text-[10px] uppercase tracking-wider font-semibold text-[var(--accent)] py-1">
              {d}
            </div>
          ))}
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={idx} className="h-9" />;
            }

            const dateStr = formatISO(year, month, day);
            const cellDate = new Date(year, month, day);
            cellDate.setHours(0, 0, 0, 0);

            const isPast = cellDate < today;
            const isUnavailable = unavailableDates.includes(dateStr);
            const isDisabled = isPast || isUnavailable;

            const isCheckIn = dateStr === tempCheckIn;
            const isCheckOut = dateStr === tempCheckOut;

            let isInRange = false;
            let isHoveredRange = false;

            if (tempCheckIn && tempCheckOut) {
              isInRange = dateStr > tempCheckIn && dateStr < tempCheckOut;
            } else if (tempCheckIn && !tempCheckOut && hoverDate) {
              isHoveredRange = dateStr > tempCheckIn && dateStr <= hoverDate;
            }

            let cellClass = "h-9 w-full flex items-center justify-center text-xs font-medium transition-all rounded-[4px] ";

            if (isDisabled) {
              cellClass += "opacity-30 cursor-not-allowed line-through text-[var(--text-secondary)]";
            } else if (isCheckIn || isCheckOut) {
              cellClass += "bg-[var(--accent)] text-[#0B0B0A] font-bold shadow-md scale-105";
            } else if (isInRange) {
              cellClass += "bg-[var(--accent)]/20 text-[var(--text-primary)] rounded-none";
            } else if (isHoveredRange) {
              cellClass += "bg-[var(--accent)]/10 text-[var(--text-primary)] rounded-none";
            } else {
              cellClass += "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] cursor-pointer";
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDayClick(dateStr)}
                onMouseEnter={() => !tempCheckOut && setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate(null)}
                className={cellClass}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Next month info for 2-month desktop layout
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  // Calculate number of nights if range is selected
  let numberOfNights = 0;
  if (tempCheckIn && tempCheckOut) {
    const d1 = new Date(tempCheckIn);
    const d2 = new Date(tempCheckOut);
    numberOfNights = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-3 z-50 w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-[360px] md:max-w-[640px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[12px] p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[var(--text-primary)] overflow-x-auto min-w-0"
    >
      {/* Month Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 text-[var(--accent)] hover:bg-[var(--bg-primary)] rounded-full transition-colors"
          title="Previous Month"
        >
          ‹
        </button>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--accent)]">
          Select Dates
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 text-[var(--accent)] hover:bg-[var(--bg-primary)] rounded-full transition-colors"
          title="Next Month"
        >
          ›
        </button>
      </div>

      {/* Months Grid (1 column on mobile, 2 columns on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderMonthGrid(currentYear, currentMonth)}
        <div className="hidden md:block">
          {renderMonthGrid(nextMonthYear, nextMonth)}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] mt-5 text-xs">
        <div>
          {tempCheckIn && tempCheckOut ? (
            <span className="text-[var(--text-primary)] font-medium">
              {formatShortDate(tempCheckIn)} – {formatShortDate(tempCheckOut)}{" "}
              <span className="text-[var(--accent)]">({numberOfNights} {numberOfNights === 1 ? "night" : "nights"})</span>
            </span>
          ) : tempCheckIn ? (
            <span className="text-[var(--text-secondary)]">Select Check-Out Date</span>
          ) : (
            <span className="text-[var(--text-secondary)]">Select Check-In Date</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {(tempCheckIn || tempCheckOut) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[var(--accent)] hover:underline font-medium text-xs transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#0B0B0A] font-semibold text-xs uppercase tracking-wider rounded-[4px] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
