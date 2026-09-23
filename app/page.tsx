import React from "react";
import { getActiveVillas } from "@/lib/api/villas";
import { HomePageClient } from "@/components/home/home-page-client";

// Ensure page revalidates or dynamically fetches latest active MongoDB villas
export const revalidate = 0;

export default async function Home() {
  const activeVillas = await getActiveVillas();

  return <HomePageClient villas={activeVillas} />;
}
