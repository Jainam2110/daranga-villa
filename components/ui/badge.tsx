import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "charcoal" | "gold" | "blush" | "peach" | "success" | "neutral";
  children: React.ReactNode;
}

export function Badge({
  variant = "gold",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-colors";

  const variants = {
    charcoal:
      "bg-[#202020] text-[#FFFFFF] border-[#202020] dark:bg-[#FCFBF8] dark:text-[#202020]",
    gold: "bg-[#B99A62]/10 text-[#B99A62] border-[#B99A62]/30 dark:bg-[#B99A62]/15 dark:text-[#B99A62]",
    blush:
      "bg-[#E8A0A8]/15 text-[#202020] dark:text-[#FCFBF8] border-[#E8A0A8]/40",
    peach:
      "bg-[#F5D0B5]/25 text-[#202020] dark:text-[#FCFBF8] border-[#F5D0B5]/50",
    success:
      "bg-[#3F6B52]/10 text-[#3F6B52] border-[#3F6B52]/30 dark:bg-[#528C6C]/15 dark:text-[#528C6C]",
    neutral:
      "bg-[#F7F6F3] text-[#66635F] border-[#E8E6E2] dark:bg-[#202020] dark:text-[#BDB8B0] dark:border-[#383633]",
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
