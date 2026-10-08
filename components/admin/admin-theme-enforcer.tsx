"use client";

import React, { useEffect } from "react";
import { useTheme } from "@/components/providers/theme-provider";

export function AdminThemeEnforcer({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Automatically default to light mode on accessing admin portal
    setTheme("light");
  }, [setTheme]);

  return <>{children}</>;
}
