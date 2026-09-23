import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
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
      "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-800 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] rounded-md cursor-pointer";

    const variants = {
      primary:
        "bg-maroon-800 text-white hover:bg-maroon-900 shadow-sm hover:shadow border border-maroon-800",
      secondary:
        "bg-maroon-50 text-maroon-900 hover:bg-maroon-100 border border-maroon-100",
      outline:
        "border border-maroon-800 text-maroon-800 hover:bg-maroon-800 hover:text-white",
      ghost:
        "text-stone-700 hover:text-maroon-800 hover:bg-stone-100",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-2 font-medium tracking-wider uppercase",
      md: "text-sm px-5 py-2.5 tracking-wide",
      lg: "text-base px-7 py-3.5 tracking-wide font-semibold",
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
