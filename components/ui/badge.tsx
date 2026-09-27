import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "charcoal" | "gold" | "blush" | "peach" | "blue" | "success" | "neutral";
  children: React.ReactNode;
}

export function Badge({
  variant = "blush",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-colors";

  const variants = {
    charcoal:
      "bg-[#202020] text-[#FFFFFF] border-[#202020] dark:bg-[#FCFBF9] dark:text-[#202020]",
    gold: "bg-[#EFA1AA]/15 text-[#202020] dark:text-[#FCFBF9] border-[#EFA1AA]/40",
    blush:
      "bg-[#EFA1AA]/15 text-[#202020] dark:text-[#FCFBF9] border-[#EFA1AA]/40",
    peach:
      "bg-[#F6D2B8]/25 text-[#202020] dark:text-[#FCFBF9] border-[#F6D2B8]/50",
    blue:
      "bg-[#DDEEFF] text-[#202020] border-[#DDEEFF] dark:bg-[#202020] dark:text-[#DDEEFF] dark:border-[#383838]",
    success:
      "bg-[#3F7658]/10 text-[#3F7658] border-[#3F7658]/30 dark:bg-[#3F7658]/20 dark:text-[#528C6C]",
    neutral:
      "bg-[#F7F7F6] text-[#555555] border-[#E8E8E8] dark:bg-[#202020] dark:text-[#BDBDBD] dark:border-[#383838]",
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
