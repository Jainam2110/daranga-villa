import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#202020] dark:focus-visible:ring-[#FCFBF8] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] rounded-[6px] cursor-pointer";

    const variants = {
      primary:
        "bg-[#202020] text-[#FFFFFF] hover:bg-[#171717] dark:bg-[#FCFBF8] dark:text-[#171717] dark:hover:bg-[#E8E6E2] shadow-sm hover:shadow border border-transparent",
      secondary:
        "bg-[#FFFFFF] text-[#202020] hover:bg-[#F7F6F3] dark:bg-[#202020] dark:text-[#FCFBF8] dark:hover:bg-[#2A2825] border border-[#DAD7D1] dark:border-[#383633] shadow-xs",
      accent:
        "bg-[#E8A0A8] text-[#202020] hover:bg-[#df919a] dark:bg-[#E8A0A8] dark:text-[#202020] border border-[#E8A0A8] shadow-xs",
      outline:
        "border border-[#DAD7D1] dark:border-[#383633] text-[#202020] dark:text-[#FCFBF8] hover:bg-[#F7F6F3] dark:hover:bg-[#202020]",
      ghost:
        "text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-[#FCFBF8] hover:bg-[#F7F6F3] dark:hover:bg-[#202020]",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-2 font-semibold tracking-wider uppercase",
      md: "text-xs sm:text-sm px-5 py-2.5 tracking-wider uppercase font-semibold",
      lg: "text-sm sm:text-base px-7 py-3.5 tracking-wider uppercase font-bold",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
