"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface DarangaLogoProps {
  /**
   * Layout variant:
   * - "horizontal" / "stacked" / "seal": Full official brand logo emblem
   * - "monogram": Icon mark only (villa + mountain + sun illustration)
   */
  variant?: "horizontal" | "stacked" | "monogram" | "seal";
  /**
   * Color theme:
   * - "auto": Adapts automatically to Light / Dark mode
   * - "gold" / "white": Uses high-contrast light/gold version for dark hero backgrounds
   * - "dark": Uses dark charcoal version for light surfaces
   */
  theme?: "auto" | "gold" | "dark" | "white";
  /**
   * Size presets: "xs" | "sm" | "md" | "lg" | "xl"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Optional boolean to toggle subtitle (kept for backward-compatibility)
   */
  withTagline?: boolean;
  /**
   * Additional custom CSS classes
   */
  className?: string;
  /**
   * Whether to wrap in a Link to "/"
   */
  asLink?: boolean;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

export function DarangaLogo({
  variant = "horizontal",
  theme = "auto",
  size = "md",
  className = "",
  asLink = false,
  onClick,
}: DarangaLogoProps) {
  // Size classes based on aspect ratio 2:1 (1024x512)
  const getSizeClasses = () => {
    if (variant === "monogram") {
      switch (size) {
        case "xs":
          return "h-6 w-8 sm:h-7 sm:w-9";
        case "sm":
          return "h-8 w-11 sm:h-10 sm:w-14";
        case "lg":
          return "h-14 w-20 sm:h-18 sm:w-24";
        case "xl":
          return "h-20 w-28 sm:h-24 sm:w-34";
        case "md":
        default:
          return "h-10 w-14 sm:h-12 sm:w-16";
      }
    }

    switch (size) {
      case "xs":
        return "h-8 w-16 sm:h-9 sm:w-18";
      case "sm":
        return "h-10 w-20 sm:h-12 sm:w-24";
      case "lg":
        return "h-16 w-32 sm:h-20 sm:w-40 lg:h-24 lg:w-48";
      case "xl":
        return "h-24 w-48 sm:h-32 sm:w-64 lg:h-40 lg:w-80";
      case "md":
      default:
        return "h-12 w-24 sm:h-14 sm:w-28 xl:h-16 xl:w-32";
    }
  };

  const sizeClass = getSizeClasses();

  // If icon-only mark
  if (variant === "monogram") {
    const isLightOnly = theme === "dark";
    const isDarkOnly = theme === "gold" || theme === "white";

    const content = (
      <div className={`relative inline-flex items-center justify-center ${sizeClass} ${className}`}>
        <Image
          src="/brand/daranga-icon-mark.webp"
          alt="Daranga Villa Icon"
          fill
          sizes="96px"
          priority
          className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
            isDarkOnly
              ? "block filter brightness-110 drop-shadow-md"
              : isLightOnly
              ? "block"
              : "block dark:filter dark:brightness-110"
          }`}
        />
      </div>
    );

    if (asLink) {
      return (
        <Link
          href="/"
          onClick={onClick}
          className="group inline-flex items-center cursor-pointer select-none focus:outline-none"
          aria-label="Daranga Villa Home"
        >
          {content}
        </Link>
      );
    }
    return (
      <div onClick={onClick} className="group inline-flex items-center select-none">
        {content}
      </div>
    );
  }

  // Full official logo emblem
  const isLightOnly = theme === "dark";
  const isDarkOnly = theme === "gold" || theme === "white";

  const content = (
    <div className={`relative inline-flex items-center justify-center ${sizeClass} ${className}`}>
      {/* Light Surface Logo (Transparent background with charcoal text) */}
      <Image
        src="/brand/daranga-logo-transparent.webp"
        alt="Daranga Villas"
        fill
        sizes="(max-width: 768px) 160px, 240px"
        priority
        className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
          isDarkOnly
            ? "hidden"
            : isLightOnly
            ? "block"
            : "block dark:hidden"
        }`}
      />

      {/* Dark Surface / Hero Overlay Logo (Clean warm champagne text & radiant illumination) */}
      <Image
        src="/brand/daranga-logo-white.webp"
        alt="Daranga Villas"
        fill
        sizes="(max-width: 768px) 160px, 240px"
        priority
        className={`object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${
          isLightOnly
            ? "hidden"
            : isDarkOnly
            ? "block"
            : "hidden dark:block"
        }`}
      />
    </div>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        onClick={onClick}
        className="group inline-flex items-center cursor-pointer select-none focus:outline-none"
        aria-label="Daranga Villa Home"
      >
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="group inline-flex items-center select-none">
      {content}
    </div>
  );
}
