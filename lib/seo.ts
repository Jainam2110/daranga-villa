import { Villa } from "@/types/villa";
import { getVillaAddress } from "@/lib/utils/villa-location";
import { getPrimaryVillaImageUrl } from "@/lib/utils/image";

/**
 * Returns the normalized production canonical site base URL.
 * Defaults to "https://darangavillas.com" if NEXT_PUBLIC_SITE_URL is missing or local.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "https://darangavillas.com";
}

/**
 * Constructs a clean canonical URL for any site path.
 */
export function getCanonicalUrl(path = ""): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") {
    return `${baseUrl}/`;
  }
  return `${baseUrl}${cleanPath.replace(/\/+$/, "")}`;
}

/**
 * Global Organization JSON-LD Structured Data
 */
export function generateOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Daranga Villas",
    legalName: "Daranga Villas Private Sanctuary",
    url: siteUrl,
    logo: `${siteUrl}/brand/daranga-icon-mark.png`,
    description:
      "Exclusive private luxury villa sanctuaries in Udaipur featuring private pool residences, 24/7 butler service, and tailored group getaways.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Udaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+919876543210",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://www.instagram.com/darangavillas",
    ],
  };
}

/**
 * Global WebSite JSON-LD Structured Data
 */
export function generateWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Daranga Villas",
    description: "Luxury Private Villas in Udaipur for exclusive family and group stays.",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };
}

/**
 * Dynamic Villa Lodging/Accommodation JSON-LD Structured Data based on factual MongoDB properties.
 * Does NOT fabricate reviews, aggregate ratings, or unverified star ratings.
 */
export function generateVillaSchema(villa: Villa) {
  const siteUrl = getSiteUrl();
  const villaUrl = getCanonicalUrl(`/villas/${villa.slug || villa.id || villa._id}`);
  const addressText = getVillaAddress(villa.location, villa.zone || "Udaipur, Rajasthan, India");
  const coverImage = getPrimaryVillaImageUrl(villa.images) || `${siteUrl}/images/hero/heroimg.webp`;

  const amenitiesList = villa.amenities && Array.isArray(villa.amenities) ? villa.amenities : [];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "Accommodation"],
    "@id": `${villaUrl}#lodging`,
    name: villa.name,
    description:
      villa.description ||
      `Private luxury stay at ${villa.name} in Udaipur featuring ${villa.bedrooms || 1} bedrooms, private pool, and concierge service.`,
    url: villaUrl,
    image: [coverImage],
    address: {
      "@type": "PostalAddress",
      streetAddress: addressText,
      addressLocality: "Udaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
    numberOfBedrooms: villa.bedrooms || 1,
    numberOfBathroomsTotal: villa.bathrooms || 1,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: villa.maxGuests || 6,
      unitCode: "C62",
    },
    amenityFeature: amenitiesList.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
  };

  // Factually add actual exact coordinates if present
  const lat =
    typeof villa.location === "object" && villa.location !== null && typeof villa.location.latitude === "number"
      ? villa.location.latitude
      : typeof villa.latitude === "number"
      ? villa.latitude
      : undefined;

  const lng =
    typeof villa.location === "object" && villa.location !== null && typeof villa.location.longitude === "number"
      ? villa.location.longitude
      : typeof villa.longitude === "number"
      ? villa.longitude
      : undefined;

  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    };
  }

  // Include price specification if valid non-zero pricePerNight present
  if (villa.pricePerNight && villa.pricePerNight > 0) {
    schema.priceRange = `₹${villa.pricePerNight.toLocaleString("en-IN")}`;
  }

  return schema;
}

/**
 * BreadcrumbList JSON-LD Structured Data for Villa Details Page
 */
export function generateVillaBreadcrumbSchema(villa: Villa) {
  const siteUrl = getSiteUrl();
  const villaUrl = getCanonicalUrl(`/villas/${villa.slug || villa.id || villa._id}`);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Villas",
        item: `${siteUrl}/villas`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: villa.name,
        item: villaUrl,
      },
    ],
  };
}
