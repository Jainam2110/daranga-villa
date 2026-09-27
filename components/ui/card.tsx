import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({
  children,
  hoverable = true,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#202020] rounded-[8px] border border-[#E8E6E2] dark:border-[#383633] p-6 text-[#202020] dark:text-[#FCFBF8] ${
        hoverable
          ? "transition-all duration-300 hover:border-[#B99A62]/50 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 hover:-translate-y-0.5"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-xl font-serif font-semibold text-[#202020] dark:text-[#FCFBF8] tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-[#66635F] dark:text-[#BDB8B0] text-sm leading-relaxed ${className}`}>
      {children}
    </p>
  );
}
