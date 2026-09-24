import React from "react";
import { getActiveVillas } from "@/lib/api/villas";
import { getActiveHeroSlides } from "@/lib/api/hero-slides";
import { HomePageClient } from "@/components/home/home-page-client";

// Ensure page revalidates or dynamically fetches latest active MongoDB villas & slides
export const revalidate = 0;

export default async function Home() {
  const [activeVillas, heroSlides] = await Promise.all([
    getActiveVillas(),
    getActiveHeroSlides(),
  ]);

  return <HomePageClient villas={activeVillas} customHeroSlides={heroSlides} />;
}
