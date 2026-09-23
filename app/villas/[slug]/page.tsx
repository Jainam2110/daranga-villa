import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVillaBySlug, getActiveVillas } from "@/lib/api/villas";
import { getPrimaryVillaImageUrl } from "@/lib/utils/image";
import { VillaDetailClient } from "@/components/villas/villa-detail-client";

export const revalidate = 0;

interface VillaSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: VillaSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const villa = await getVillaBySlug(slug);

  if (!villa) {
    return {
      title: "Villa Not Found | Daranga Villa",
      description: "The requested private villa residence could not be found.",
    };
  }

  const primaryCoverUrl = getPrimaryVillaImageUrl(villa.images);

  return {
    title: `${villa.name} | Daranga Villa`,
    description:
      villa.description ||
      `Experience private luxury stay at ${villa.name} featuring ${villa.bedrooms} bedrooms, private pool, and 24/7 concierge.`,
    openGraph: {
      title: `${villa.name} | Daranga Villa`,
      description: villa.description || `Private villa stay at ${villa.name}`,
      images: [{ url: primaryCoverUrl }],
    },
  };
}

export default async function VillaSlugPage({ params }: VillaSlugPageProps) {
  const { slug } = await params;
  const villa = await getVillaBySlug(slug);

  if (!villa) {
    notFound();
  }

  const allActiveVillas = await getActiveVillas();
  const relatedVillas = allActiveVillas.filter(
    (v) => v.id !== villa.id && v._id !== villa._id
  );

  return <VillaDetailClient villa={villa} relatedVillas={relatedVillas} />;
}

