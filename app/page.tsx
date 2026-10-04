import React from "react";
import type { Metadata } from "next";
import { getActiveVillas } from "@/lib/api/villas";
import { getActiveHeroSlides } from "@/lib/api/hero-slides";
import { HomePageClient } from "@/components/home/home-page-client";
import { getCanonicalUrl, getSiteUrl } from "@/lib/seo";

// Ensure page revalidates or dynamically fetches latest active MongoDB villas & slides
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Daranga Villas | Luxury Private Villas in Udaipur",
  description:
    "Book private luxury villas in Udaipur for family retreats, corporate getaways, and weekend stays featuring private pools, mountain views, and 24/7 hospitality.",
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  openGraph: {
    title: "Daranga Villas | Luxury Private Villas in Udaipur",
    description:
      "Book private luxury villas in Udaipur for family retreats, corporate getaways, and weekend stays featuring private pools.",
    url: getCanonicalUrl("/"),
    siteName: "Daranga Villas",
    images: [
      {
        url: `${getSiteUrl()}/images/hero/heroimg.webp`,
        width: 1200,
        height: 630,
        alt: "Daranga Villas Udaipur Luxury Sanctuaries",
      },
    ],
  },
};

export default async function Home() {
  const [activeVillas, heroSlides] = await Promise.all([
    getActiveVillas(),
    getActiveHeroSlides(),
  ]);

  return <HomePageClient villas={activeVillas} customHeroSlides={heroSlides} />;
}

