"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, Calendar, Users, Sparkles } from "lucide-react";
import { LuxuryDatePicker } from "@/components/ui/luxury-date-picker";
import { LuxuryGuestPopover } from "@/components/ui/luxury-guest-popover";

interface HeroSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
  onSelectGuests?: (guests: number) => void;
  className?: string;
}

const PLACEHOLDER_SUGGESTIONS = [
  "Search for a property in Udaipur",
  "Search private pool villas in Udaipur",
  "Search lakeview luxury stays in Udaipur",
  "Search heritage suites in Udaipur",
  "Search 3 BHK & 4 BHK villas in Udaipur",
];

const POPULAR_QUICK_TAGS = [
  "Private Pool",
  "Lakeview",
  "Heritage",
  "3 BHK",
  "Celebrations",
  "Tiger Hills",
  "Pet Friendly",
];

export function HeroSearchBar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  checkIn = "",
  checkOut = "",
  guests = 2,
  onSelectDates,
  onSelectGuests,
  className = "",
}: HeroSearchBarProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder text every 3.5s
  useEffect(() => {
    if (isFocused || searchQuery) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_SUGGESTIONS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isFocused, searchQuery]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setShowDatePicker(false);
        setShowGuestPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsFocused(false);
    setShowDatePicker(false);
    setShowGuestPicker(false);
    inputRef.current?.blur();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      const el = document.getElementById("villas");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSelectTag = (tag: string) => {
    onSearchChange(tag);
    setIsFocused(false);
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      const el = document.getElementById("villas");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const formatShortDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-4xl mx-auto px-4 z-30 select-none ${className}`}
    >
      {/* 1. MOBILE STANDALONE SEARCH PILL (matching reference exactly) */}
      <div className="block md:hidden">
        <form
          onSubmit={handleSubmit}
          className={`relative flex items-center justify-between w-full bg-white dark:bg-[#202020] rounded-full px-5 py-3 sm:py-3.5 transition-all duration-300 ${
            isFocused
              ? "shadow-[0_8px_30px_rgba(239,161,170,0.3)] ring-2 ring-[#EFA1AA] border-transparent"
              : "shadow-[0_8px_24px_rgba(32,32,32,0.08)] border border-[#E8E8E8] dark:border-[#383838]"
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={PLACEHOLDER_SUGGESTIONS[placeholderIndex]}
              className="w-full bg-transparent text-[#202020] dark:text-white placeholder-[#777777] text-sm font-normal tracking-wide focus:outline-none truncate"
              aria-label="Search for a property in Udaipur"
            />
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="p-1 text-[#777777] hover:text-[#202020] dark:hover:text-white transition-colors rounded-full"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-[#202020] hover:bg-[#171717] text-white flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0"
              aria-label="Submit search"
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. DESKTOP MULTI-FIELD LUXURY SEARCH BAR */}
      <div className="hidden md:block">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-white dark:bg-[#202020] rounded-full p-2 border border-[#E8E8E8] dark:border-[#383838] shadow-[0_10px_32px_rgba(32,32,32,0.06)] hover:shadow-[0_12px_36px_rgba(32,32,32,0.09)] transition-all duration-300"
        >
          {/* Field 1: Location / Property Query */}
          <div className="flex-[1.4] px-5 py-2 border-r border-[#E8E8E8] dark:border-[#383838] relative">
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#777777] dark:text-[#999999]">
              Destination
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#202020] dark:text-white flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Udaipur, Rajasthan"
                className="w-full bg-transparent text-[#202020] dark:text-white placeholder-[#555555] dark:placeholder-[#999999] text-xs font-semibold tracking-wide focus:outline-none truncate"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="p-0.5 text-[#777777] hover:text-[#202020] dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Field 2 & 3: Check-in / Check-out Dates */}
          <div className="flex-1 px-4 py-2 border-r border-[#E8E8E8] dark:border-[#383838] relative">
            <button
              type="button"
              onClick={() => {
                setShowDatePicker((prev) => !prev);
                setShowGuestPicker(false);
                setIsFocused(false);
              }}
              className="w-full text-left"
            >
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#777777] dark:text-[#999999] cursor-pointer">
                Dates
              </label>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-[#202020] dark:text-white truncate">
                <Calendar className="w-3.5 h-3.5 text-[#202020] dark:text-white flex-shrink-0" />
                <span>
                  {checkIn && checkOut
                    ? `${formatShortDate(checkIn)} - ${formatShortDate(checkOut)}`
                    : "Add Dates"}
                </span>
              </div>
            </button>
          </div>

          {/* Field 4: Guests */}
          <div className="flex-[0.9] px-4 py-2 relative">
            <button
              type="button"
              onClick={() => {
                setShowGuestPicker((prev) => !prev);
                setShowDatePicker(false);
                setIsFocused(false);
              }}
              className="w-full text-left"
            >
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#777777] dark:text-[#999999] cursor-pointer">
                Guests
              </label>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-[#202020] dark:text-white truncate">
                <Users className="w-3.5 h-3.5 text-[#202020] dark:text-white flex-shrink-0" />
                <span>{guests} {guests === 1 ? "Guest" : "Guests"}</span>
              </div>
            </button>
          </div>

          {/* Search Button: Black #202020 with White Text */}
          <div className="pl-2 pr-1 flex-shrink-0">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#202020] hover:bg-[#171717] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs hover:scale-[1.02] cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Date Picker Popover */}
        {showDatePicker && (
          <div className="relative">
            <LuxuryDatePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDates={(inDate, outDate) => {
                if (onSelectDates) onSelectDates(inDate, outDate);
              }}
              onClose={() => setShowDatePicker(false)}
            />
          </div>
        )}

        {/* Guest Picker Popover */}
        {showGuestPicker && (
          <div className="relative">
            <LuxuryGuestPopover
              guests={guests}
              onChangeGuests={(g) => {
                if (onSelectGuests) onSelectGuests(g);
              }}
              onClose={() => setShowGuestPicker(false)}
            />
          </div>
        )}
      </div>

      {/* Focus / Quick Suggestions Dropdown Popover */}
      {isFocused && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383838] rounded-[16px] p-4 sm:p-5 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-3 z-40">
          <div className="flex items-center justify-between text-xs text-[#777777] border-b border-[#E8E8E8] dark:border-[#383838] pb-2.5">
            <span className="flex items-center gap-1.5 font-semibold text-[#202020] dark:text-white uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-[#EFA1AA]" />
              Popular Udaipur Searches
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#555555] dark:text-[#BDBDBD]">
              <MapPin className="w-3 h-3 text-[#202020] dark:text-white" />
              Udaipur, Rajasthan
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {POPULAR_QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={() => handleSelectTag(tag)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#F7F7F6] dark:bg-[#171717] hover:bg-[#202020] hover:text-white dark:hover:bg-white dark:hover:text-[#202020] text-[#202020] dark:text-white border border-[#E8E8E8] dark:border-[#383838] transition-all cursor-pointer shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
