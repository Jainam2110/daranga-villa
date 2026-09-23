import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "maroon" | "gold" | "neutral";
  children: React.ReactNode;
}

export function Badge({
  variant = "maroon",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border transition-colors";

  const variants = {
    maroon: "bg-maroon-50 text-maroon-900 border-maroon-200",
    gold: "bg-gold-50 text-gold-600 border-gold-400/40",
    neutral: "bg-stone-100 text-stone-700 border-stone-200",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
