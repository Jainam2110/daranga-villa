"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, Sparkles } from "lucide-react";

interface HeroSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
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
  className = "",
}: HeroSearchBarProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
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

  // Handle outside click to close quick tags dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsFocused(false);
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

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-2xl mx-auto px-4 z-30 select-none ${className}`}
    >
      {/* Floating Pill Search Container */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center justify-between w-full bg-white dark:bg-[#202020] rounded-full px-5 sm:px-6 py-3 sm:py-3.5 transition-all duration-300 ${
          isFocused
            ? "shadow-[0_12px_40px_rgba(232,160,168,0.25)] ring-2 ring-[#E8A0A8]/60 border-transparent"
            : "shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-[#E8E6E2] dark:border-[#383633] hover:shadow-[0_12px_36px_rgba(0,0,0,0.14)]"
        }`}
      >
        {/* Left Side: Search Input with location accent */}
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
          <div className="flex-1 min-w-0 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={PLACEHOLDER_SUGGESTIONS[placeholderIndex]}
              className="w-full bg-transparent text-[#202020] dark:text-[#FCFBF8] placeholder-[#8A8782] text-sm sm:text-base font-normal tracking-wide focus:outline-none truncate"
              aria-label="Search for a property in Udaipur"
            />
          </div>
        </div>

        {/* Right Side: Clear button & Magnifying Glass Search Icon */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="p-1 text-[#8A8782] hover:text-[#202020] dark:hover:text-[#FCFBF8] transition-colors rounded-full"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-transparent hover:bg-[#F7F6F3] dark:hover:bg-[#2A2A2A] text-[#202020] dark:text-[#FCFBF8] flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0"
            aria-label="Submit search"
          >
            <Search className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </form>

      {/* Focus / Quick Suggestions Dropdown Popover */}
      {isFocused && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] rounded-[16px] p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-3 z-40">
          <div className="flex items-center justify-between text-xs text-[#8A8782] border-b border-[#E8E6E2] dark:border-[#383633] pb-2.5">
            <span className="flex items-center gap-1.5 font-semibold text-[#B99A62] uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5" />
              Popular Udaipur Searches
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <MapPin className="w-3 h-3 text-[#B99A62]" />
              Udaipur, Rajasthan
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {POPULAR_QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={() => handleSelectTag(tag)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#F7F6F3] dark:bg-[#171717] hover:bg-[#B99A62] hover:text-white dark:hover:bg-[#B99A62] dark:hover:text-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#E8E6E2] dark:border-[#383633] transition-all cursor-pointer shadow-2xs"
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
