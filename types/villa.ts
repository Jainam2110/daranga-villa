export interface VillaImageObject {
  url: string;
  publicId: string;
}

export type VillaImage = VillaImageObject | string;

export interface Villa {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  location?: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
  mapX?: number;
  mapY?: number;
  images?: (VillaImageObject | string)[];
  imageUrl?: string;
  pricePerNight: number;
  currency?: string;
  maxGuests?: number;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  houseRules?: string[];
  highlights?: string[];
  cancellationPolicy?: string;
  status?: "ACTIVE" | "INACTIVE";
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: "luxury" | "comfort" | "wellness" | "service";
}

export interface Experience {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  badge: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}
