export type VillaImageCategory =
  | "EXTERIOR"
  | "LIVING_ROOM"
  | "BEDROOM"
  | "BATHROOM"
  | "KITCHEN"
  | "POOL"
  | "DINING"
  | "GARDEN"
  | "BALCONY"
  | "VIEW"
  | "AMENITIES"
  | "OTHER";

export const VILLA_IMAGE_CATEGORIES: { value: VillaImageCategory; label: string }[] = [
  { value: "EXTERIOR", label: "Exterior" },
  { value: "LIVING_ROOM", label: "Living Room" },
  { value: "BEDROOM", label: "Bedroom" },
  { value: "BATHROOM", label: "Bathroom" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "POOL", label: "Pool" },
  { value: "DINING", label: "Dining" },
  { value: "GARDEN", label: "Garden" },
  { value: "BALCONY", label: "Balcony" },
  { value: "VIEW", label: "View" },
  { value: "AMENITIES", label: "Amenities" },
  { value: "OTHER", label: "Other" },
];

export interface VillaImageObject {
  url: string;
  publicId?: string;
  category?: VillaImageCategory;
  label?: string;
}

export type VillaImage = VillaImageObject | string;

export interface VillaLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface Villa {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  location?: string | VillaLocation;
  zone?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
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
