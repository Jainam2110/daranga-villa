import { MetadataRoute } from "next";
import { getActiveVillas } from "@/lib/api/villas";
import { getSiteUrl } from "@/lib/seo";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const currentDate = new Date();

  // Static public indexable routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/villas`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about-udaipur`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const activeVillas = await getActiveVillas();

    const villaRoutes: MetadataRoute.Sitemap = activeVillas.map((villa) => {
      const villaSlug = String(villa.slug || villa.id || villa._id || "");
      const lastMod = villa.updatedAt
        ? new Date(villa.updatedAt)
        : villa.createdAt
        ? new Date(villa.createdAt)
        : currentDate;

      return {
        url: `${siteUrl}/villas/${encodeURIComponent(villaSlug)}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...villaRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap from MongoDB:", error);
    return staticRoutes;
  }
}
