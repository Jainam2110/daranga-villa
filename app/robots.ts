import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/account/",
          "/api/",
          "/login",
          "/signup",
          "/checkout/",
          "/*?*", // Prevent query string duplication indexing
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
