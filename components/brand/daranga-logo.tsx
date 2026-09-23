"use client";

import React from "react";
import Link from "next/link";

export interface DarangaLogoProps {
  /**
   * Layout variant:
   * - "horizontal": Monogram on left + DARANGA VILLA wordmark & tagline on right (ideal for Navbar)
   * - "stacked": Centered monogram on top + DARANGA VILLA + tagline on bottom (ideal for Footer, Login/Signup)
   * - "monogram": Only the DV icon mark with house, palm & wave (ideal for Favicon, Mobile Header, Avatar)
   * - "seal": Circular luxury seal badge
   */
  variant?: "horizontal" | "stacked" | "monogram" | "seal";
  /**
   * Color theme:
   * - "auto": Adapts seamlessly to current Light / Dark theme
   * - "gold": Radiant brushed luxury gold (ideal over dark/hero backgrounds)
   * - "dark": Deep obsidian charcoal / bronze (ideal over light surfaces)
   * - "white": Pure crisp white
   */
  theme?: "auto" | "gold" | "dark" | "white";
  /**
   * Optional custom height/size: "xs" | "sm" | "md" | "lg" | "xl"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Whether to include the "STAY BEYOND ORDINARY" subtitle tagline
   */
  withTagline?: boolean;
  /**
   * Additional custom CSS classes
   */
  className?: string;
  /**
   * Wrap in home link
   */
  asLink?: boolean;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * DV Monogram Vector Graphic:
 * Recreates the interlocking 'D' & 'V', integrated pitched villa roof,
 * 4-pane window, tropical palm tree, and flowing ocean wave flourish.
 * Tight bounding box: viewBox="36 24 280 176" for maximum visual impact and zero wasted padding.
 */
export function DarangaMonogramSvg({
  className = "",
  gradientId = "dvGoldGrad",
}: {
  className?: string;
  gradientId?: string;
}) {
  return (
    <svg
      viewBox="36 24 280 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible flex-shrink-0 ${className}`}
      aria-label="Daranga Villa Monogram"
    >
      <defs>
        {/* Luxury Brushed Champagne Gold Gradient */}
        <linearGradient
          id={gradientId}
          x1="36"
          y1="24"
          x2="310"
          y2="195"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F5E4B8" />
          <stop offset="20%" stopColor="#ECC880" />
          <stop offset="45%" stopColor="#C89B4A" />
          <stop offset="70%" stopColor="#F5E4B8" />
          <stop offset="90%" stopColor="#B5893A" />
          <stop offset="100%" stopColor="#DDB566" />
        </linearGradient>

        {/* Deep Obsidian Charcoal Bronze for Light Theme */}
        <linearGradient
          id={`${gradientId}-dark`}
          x1="36"
          y1="24"
          x2="310"
          y2="195"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2D2820" />
          <stop offset="50%" stopColor="#171513" />
          <stop offset="100%" stopColor="#3A3329" />
        </linearGradient>
      </defs>

      <g className="dv-monogram-paths">
        {/* 1. Letter 'D' Serif Stem & Bowl */}
        {/* Left vertical stem with top-left bracketed serif */}
        <path
          d="M 68 32 H 108 V 42 H 98 V 142 H 108 V 152 H 68 V 142 H 78 V 42 H 68 Z"
          fill="currentColor"
        />

        {/* 'D' Top Bar & Outer Sweeping Arc */}
        <path
          d="M 98 32 C 145 32 188 58 188 106 C 188 128 178 145 160 156 L 152 144 C 166 135 173 122 173 106 C 173 68 138 46 98 46 Z"
          fill="currentColor"
        />

        {/* 2. Villa Roof / House Gable */}
        {/* Pitched Triangular Roof */}
        <path
          d="M 125 78 L 176 122 L 170 128 L 125 88 L 80 128 L 74 122 Z"
          fill="currentColor"
        />
        {/* Sub-ridge line / eave highlight */}
        <path
          d="M 125 94 L 160 125 L 155 129 L 125 102 L 95 129 L 90 125 Z"
          fill="currentColor"
          opacity="0.85"
        />

        {/* 4-Pane Square Window inside House Gable */}
        <rect x="115" y="112" width="8" height="8" rx="0.5" fill="currentColor" />
        <rect x="127" y="112" width="8" height="8" rx="0.5" fill="currentColor" />
        <rect x="115" y="124" width="8" height="8" rx="0.5" fill="currentColor" />
        <rect x="127" y="124" width="8" height="8" rx="0.5" fill="currentColor" />

        {/* 3. Letter 'V' Downstroke & Upstroke */}
        {/* Left Downstroke (merging with roof right slope) */}
        <path
          d="M 125 84 L 172 174 H 186 L 138 84 Z"
          fill="currentColor"
        />

        {/* Right Upstroke ascending with terminal flare */}
        <path
          d="M 166 174 L 218 64 H 236 L 180 174 Z"
          fill="currentColor"
        />
        {/* Top-Right Serif Flare on 'V' */}
        <path
          d="M 214 64 H 242 V 72 H 234 L 218 106 Z"
          fill="currentColor"
        />

        {/* 4. Elegant Palm Tree on the Right */}
        {/* Slender Curved Trunk */}
        <path
          d="M 226 172 C 228 140 238 108 250 82 C 248 108 238 140 234 172 Z"
          fill="currentColor"
        />

        {/* Palm Crown Fronds (Fanned Tropical Leaves) */}
        {/* Top-Center Frond */}
        <path
          d="M 250 82 C 254 62 268 46 284 38 C 274 50 266 66 252 82 Z"
          fill="currentColor"
        />
        <path
          d="M 252 74 C 262 58 276 48 292 46 C 280 56 270 68 254 78 Z"
          fill="currentColor"
        />

        {/* Top-Left Frond (arching toward V) */}
        <path
          d="M 250 82 C 240 64 224 54 204 52 C 220 58 234 68 248 82 Z"
          fill="currentColor"
        />
        <path
          d="M 248 76 C 236 62 220 56 206 58 C 222 64 236 72 246 80 Z"
          fill="currentColor"
        />

        {/* Right Arched Frond */}
        <path
          d="M 250 82 C 266 74 286 74 304 82 C 288 84 272 84 252 84 Z"
          fill="currentColor"
        />
        <path
          d="M 252 84 C 270 82 292 86 308 96 C 290 94 274 90 252 86 Z"
          fill="currentColor"
        />

        {/* Bottom-Right Drooping Frond */}
        <path
          d="M 250 82 C 264 92 278 106 286 124 C 276 112 264 100 250 86 Z"
          fill="currentColor"
        />
        <path
          d="M 248 84 C 258 98 268 114 272 132 C 264 118 256 104 246 88 Z"
          fill="currentColor"
        />

        {/* Bottom-Left Lower Frond */}
        <path
          d="M 250 82 C 238 88 226 98 218 112 C 228 102 240 94 250 84 Z"
          fill="currentColor"
        />

        {/* 5. Sweeping Wave / Flowing Landscape Ribbon */}
        {/* Main Ribbon Flourish */}
        <path
          d="M 44 172 C 86 150 142 152 186 178 C 222 198 268 194 302 170 C 266 186 220 184 186 166 C 142 142 86 142 44 172 Z"
          fill="currentColor"
        />
        {/* Lower Secondary Tapered Wave Accent under Palm */}
        <path
          d="M 220 188 C 252 190 282 184 306 174 C 282 180 252 182 220 188 Z"
          fill="currentColor"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

/**
 * Main Daranga Logo Component
 */
export function DarangaLogo({
  variant = "horizontal",
  theme = "auto",
  size = "md",
  withTagline = true,
  className = "",
  asLink = false,
  onClick,
}: DarangaLogoProps) {
  // Theme color classes for Monogram SVG
  const getThemeClasses = () => {
    switch (theme) {
      case "gold":
        return "text-[#C89B4A] dark:text-[#C89B4A]";
      case "dark":
        return "text-[#171513] dark:text-[#F4EFE5]";
      case "white":
        return "text-white dark:text-white";
      case "auto":
      default:
        return "text-[#171513] dark:text-[#F4EFE5] group-hover:text-[#A8792E] dark:group-hover:text-[#C89B4A]";
    }
  };

  // Title color classes
  const getTitleClasses = () => {
    switch (theme) {
      case "gold":
        return "text-[#F5E4B8] group-hover:text-white";
      case "white":
        return "text-white group-hover:text-stone-200";
      case "dark":
        return "text-[#171513] dark:text-[#F4EFE5]";
      case "auto":
      default:
        return "text-[#171513] dark:text-[#F4EFE5] group-hover:text-[#A8792E] dark:group-hover:text-[#C89B4A]";
    }
  };

  // Tagline color classes
  const getTaglineClasses = () => {
    switch (theme) {
      case "gold":
        return "text-[#C89B4A]";
      case "white":
        return "text-stone-300";
      case "dark":
        return "text-[#825C25] dark:text-[#C89B4A]";
      case "auto":
      default:
        return "text-[#825C25] dark:text-[#C89B4A]";
    }
  };

  // Tagline separator line classes
  const getLineClasses = () => {
    switch (theme) {
      case "gold":
        return "bg-[#C89B4A]";
      case "white":
        return "bg-white/40";
      case "dark":
        return "bg-[#825C25] dark:bg-[#C89B4A]";
      case "auto":
      default:
        return "bg-[#825C25] dark:bg-[#C89B4A]";
    }
  };

  // Substantially increased, prominent size configurations
  const getSizeStyles = () => {
    switch (size) {
      case "xs":
        return {
          monogram: "w-8 h-6.5 sm:w-10 sm:h-8",
          title: "text-xs sm:text-sm tracking-[0.2em] font-medium",
          tagline: "text-[7.5px] sm:text-[8.5px] tracking-[0.26em] font-semibold",
          gap: "gap-2 sm:gap-2.5",
          line: "w-3 sm:w-4 h-[1px]",
        };
      case "sm":
        return {
          monogram: "w-11 h-8.5 sm:w-14 sm:h-10.5",
          title: "text-sm sm:text-base md:text-lg tracking-[0.22em] font-medium",
          tagline: "text-[8px] sm:text-[9.5px] md:text-[10px] tracking-[0.28em] font-semibold",
          gap: "gap-2.5 sm:gap-3 md:gap-3.5",
          line: "w-3.5 sm:w-5 h-[1px]",
        };
      case "lg":
        return {
          monogram: "w-20 h-15 sm:w-26 sm:h-19.5 lg:w-32 lg:h-24",
          title: "text-xl sm:text-2xl lg:text-3xl tracking-[0.26em] font-medium",
          tagline: "text-[11px] sm:text-[13px] lg:text-[15px] tracking-[0.32em] font-semibold",
          gap: "gap-4 sm:gap-5 lg:gap-6",
          line: "w-5 sm:w-8 h-[1.25px]",
        };
      case "xl":
        return {
          monogram: "w-28 h-21 sm:w-36 sm:h-27 lg:w-48 lg:h-36",
          title: "text-2xl sm:text-4xl lg:text-5xl tracking-[0.3em] font-normal",
          tagline: "text-[13px] sm:text-[16px] lg:text-[20px] tracking-[0.36em] font-semibold",
          gap: "gap-5 sm:gap-7 lg:gap-9",
          line: "w-7 sm:w-12 h-[1.5px]",
        };
      case "md":
      default:
        return {
          monogram: "w-13 h-10 sm:w-16 sm:h-12 xl:w-20 xl:h-15",
          title: "text-base sm:text-lg xl:text-2xl tracking-[0.2em] xl:tracking-[0.26em] font-medium",
          tagline: "text-[8.5px] sm:text-[10px] xl:text-[12px] tracking-[0.26em] xl:tracking-[0.32em] font-semibold",
          gap: "gap-2.5 sm:gap-3.5 xl:gap-4.5",
          line: "w-4 sm:w-6 xl:w-8 h-[1px]",
        };
    }
  };

  const sizes = getSizeStyles();
  const themeClasses = getThemeClasses();
  const titleClasses = getTitleClasses();
  const taglineClasses = getTaglineClasses();
  const lineClasses = getLineClasses();

  // Content Renderer
  const renderContent = () => {
    // 1. Monogram Only
    if (variant === "monogram") {
      return (
        <div className={`inline-flex items-center justify-center ${themeClasses} ${className}`}>
          <DarangaMonogramSvg className={`${sizes.monogram} transition-transform duration-300 group-hover:scale-105`} />
        </div>
      );
    }

    // 2. Circular Seal / Badge
    if (variant === "seal") {
      return (
        <div className={`relative inline-flex flex-col items-center justify-center p-6 rounded-full border border-[var(--accent)]/40 ${themeClasses} ${className}`}>
          <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--accent)] font-semibold mb-1">
            DARANGA VILLA
          </div>
          <DarangaMonogramSvg className="w-20 h-15 my-2" />
          <div className="text-[8px] uppercase tracking-[0.3em] text-[var(--accent)] font-medium mt-1">
            STAY BEYOND ORDINARY
          </div>
        </div>
      );
    }

    // 3. Stacked (Monogram Centered on Top, Wordmark + Tagline on Bottom)
    if (variant === "stacked") {
      return (
        <div className={`inline-flex flex-col items-center text-center ${sizes.gap} ${themeClasses} ${className}`}>
          <DarangaMonogramSvg className={`${sizes.monogram} transition-transform duration-500 group-hover:scale-105 drop-shadow-md`} />
          <div className="flex flex-col items-center">
            <span className={`font-serif uppercase ${titleClasses} ${sizes.title} leading-none drop-shadow-sm`}>
              DARANGA VILLA
            </span>
            {withTagline && (
              <div className="flex items-center gap-2.5 mt-2.5 opacity-95">
                <span className={`${sizes.line} ${lineClasses}`} />
                <span className={`font-sans uppercase ${taglineClasses} ${sizes.tagline}`}>
                  STAY BEYOND ORDINARY
                </span>
                <span className={`${sizes.line} ${lineClasses}`} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 4. Horizontal (Monogram on Left, Wordmark + Tagline on Right - Default / Navbar)
    return (
      <div className={`inline-flex items-center ${sizes.gap} ${themeClasses} ${className}`}>
        <DarangaMonogramSvg className={`${sizes.monogram} transition-transform duration-300 group-hover:scale-105 drop-shadow-sm`} />
        <div className="flex flex-col justify-center leading-tight">
          <span className={`font-serif uppercase ${titleClasses} ${sizes.title} leading-none drop-shadow-xs`}>
            DARANGA VILLA
          </span>
          {withTagline && (
            <div className="flex items-center gap-2 mt-1.5 sm:mt-2 opacity-95">
              <span className={`${sizes.line} ${lineClasses}`} />
              <span className={`font-sans uppercase ${taglineClasses} ${sizes.tagline} leading-none`}>
                STAY BEYOND ORDINARY
              </span>
              <span className={`${sizes.line} ${lineClasses}`} />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (asLink) {
    return (
      <Link
        href="/"
        onClick={onClick}
        className="group inline-flex items-center select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-sm"
        aria-label="Daranga Villa Home"
      >
        {renderContent()}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="group inline-flex items-center select-none">
      {renderContent()}
    </div>
  );
}
