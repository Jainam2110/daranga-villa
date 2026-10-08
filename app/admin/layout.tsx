import type { Metadata } from "next";
import { AdminThemeEnforcer } from "@/components/admin/admin-theme-enforcer";

export const metadata: Metadata = {
  title: "Admin Portal | Daranga Villas",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminThemeEnforcer>{children}</AdminThemeEnforcer>;
}
