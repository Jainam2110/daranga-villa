import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "narrow" | "default" | "wide";
}

export function Container({
  children,
  size = "default",
  className = "",
  ...props
}: ContainerProps) {
  const sizeStyles = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-7xl px-4 sm:px-8",
  };

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
