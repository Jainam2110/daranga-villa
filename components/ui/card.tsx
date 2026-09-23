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
      className={`bg-white rounded-xl border border-stone-200/80 p-6 ${
        hoverable
          ? "transition-all duration-300 hover:border-maroon-200 hover:shadow-lg hover:shadow-maroon-950/5 hover:-translate-y-0.5"
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
      className={`text-xl font-serif font-semibold text-stone-900 tracking-tight ${className}`}
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
    <p className={`text-stone-600 text-sm leading-relaxed ${className}`}>
      {children}
    </p>
  );
}
