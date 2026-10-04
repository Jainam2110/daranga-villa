import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVillaBySlug, getActiveVillas } from "@/lib/api/villas";
import { getPrimaryVillaImageUrl } from "@/lib/utils/image";
import { getVillaAddress } from "@/lib/utils/villa-location";
import { VillaDetailClient } from "@/components/villas/villa-detail-client";
import {
  getCanonicalUrl,
  getSiteUrl,
  generateVillaSchema,
  generateVillaBreadcrumbSchema,
} from "@/lib/seo";

export const revalidate = 0;

interface VillaSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: VillaSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug || "");
  const villa = await getVillaBySlug(decodedSlug);

  if (!villa) {
    return {
      title: "Villa Not Found | Daranga Villas",
      description: "The requested private villa residence could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = getCanonicalUrl(`/villas/${decodedSlug}`);
  const primaryCoverUrl =
    getPrimaryVillaImageUrl(villa.images) || `${siteUrl}/images/hero/heroimg.webp`;

  const locationText = getVillaAddress(
    villa.location,
    villa.zone || "Udaipur, Rajasthan"
  );
  const factualDescription =
    villa.description ||
    `Stay at ${villa.name}, a private ${villa.bedrooms || 1} BHK luxury villa in ${locationText} accommodating up to ${villa.maxGuests || 6} guests.`;

  return {
    title: `${villa.name} | Daranga Villas`,
    description: factualDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${villa.name} | Daranga Villas`,
      description: factualDescription,
      url: canonicalUrl,
      siteName: "Daranga Villas",
      type: "website",
      images: [
        {
          url: primaryCoverUrl,
          alt: `${villa.name} Luxury Private Villa in Udaipur`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${villa.name} | Daranga Villas`,
      description: factualDescription,
      images: [primaryCoverUrl],
    },
  };
}

export default async function VillaSlugPage({ params }: VillaSlugPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug || "");
  const villa = await getVillaBySlug(decodedSlug);

  if (!villa) {
    notFound();
  }

  const allActiveVillas = await getActiveVillas();
  const relatedVillas = allActiveVillas.filter(
    (v) => v.id !== villa.id && v._id !== villa._id
  );

  const villaSchema = generateVillaSchema(villa);
  const breadcrumbSchema = generateVillaBreadcrumbSchema(villa);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(villaSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <VillaDetailClient villa={villa} relatedVillas={relatedVillas} />
    </>
  );
}


