import { Villa, Amenity, Experience, GalleryItem } from "@/types/villa";

export const SAMPLE_VILLAS: Villa[] = [
  {
    id: "villa-celestial",
    name: "The Celestial Residence",
    tagline: "Cliffside oceanfront sanctuary with infinity pool",
    location: "Daranga Hills, South Estate",
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4.5,
    pricePerNight: 850,
    currency: "USD",
    rating: 4.98,
    reviewsCount: 32,
    imageUrl:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    highlights: ["Private Infinity Pool", "Ocean Sunset Views", "Personal Butler"],
  },
  {
    id: "villa-royal-haven",
    name: "Royal Pavilion Villa",
    tagline: "Secluded garden retreat with outdoor spa & dining pavilion",
    location: "Daranga Valley, Central Estate",
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    pricePerNight: 650,
    currency: "USD",
    rating: 4.95,
    reviewsCount: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    highlights: ["Open-air Dining Pavilion", "Jacuzzi & Spa Deck", "Private Chef"],
  },
  {
    id: "villa-serenity-manor",
    name: "Serenity Bay Manor",
    tagline: "Ultra-luxurious 5-bedroom estate with private beachfront access",
    location: "Daranga Cove, North Estate",
    maxGuests: 12,
    bedrooms: 5,
    bathrooms: 6,
    pricePerNight: 1250,
    currency: "USD",
    rating: 5.0,
    reviewsCount: 19,
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    highlights: ["Private Beach Path", "Plunge Pool Suite", "24/7 Security & Concierge"],
  },
];

export const WHY_US_FEATURES = [
  {
    id: "private-luxury",
    title: "Unrivaled Private Luxury",
    description:
      "Every villa is designed as an isolated private sanctuary with expansive living areas, private pools, and complete quietude.",
    icon: "shield-check",
  },
  {
    id: "premium-amenities",
    title: "Premium World-Class Amenities",
    description:
      "High-speed fiber connectivity, climate-controlled suites, artisanal bath products, and state-of-the-art entertainment.",
    icon: "sparkles",
  },
  {
    id: "personalized-service",
    title: "Personalized Concierge Service",
    description:
      "Dedicated 24/7 butler attention, customized daily itineraries, in-villa spa treatments, and private chef dining.",
    icon: "user-star",
  },
  {
    id: "peaceful-location",
    title: "Serene & Prime Location",
    description:
      "Situated in pristine natural surroundings offering breathtaking sunset views while remaining easily accessible.",
    icon: "map-pin",
  },
];

export const SAMPLE_EXPERIENCES: Experience[] = [
  {
    id: "exp-private-dining",
    title: "Bespoke In-Villa Dining",
    subtitle: "Private Chef & Wine Pairing",
    description:
      "Savor multi-course gourmet dinners prepared exclusively for your party using fresh local ingredients and fine vintage pairings.",
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    badge: "Gastronomy",
  },
  {
    id: "exp-pool-lounge",
    title: "Sunset Infinity Pool Lounge",
    subtitle: "Private Deck Refreshments",
    description:
      "Unwind with hand-crafted signature cocktails and organic refreshers while floating overlooking ocean horizons.",
    imageUrl:
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
    badge: "Relaxation",
  },
  {
    id: "exp-nature-wellness",
    title: "Nature & Spa Excursions",
    subtitle: "Guided Wellness Rituals",
    description:
      "Immerse yourself in sunrise yoga, deep-tissue aromatherapy spa rituals, and curated nature trail explorations.",
    imageUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    badge: "Wellness",
  },
];

export const AMENITIES_LIST: Amenity[] = [
  {
    id: "pool",
    name: "Private Infinity Pool",
    description: "Temperature-controlled swimming pool with private sun deck and loungers.",
    iconName: "pool",
    category: "luxury",
  },
  {
    id: "wifi",
    name: "High-Speed Wi-Fi",
    description: "Seamless optical fiber internet access across all indoor and outdoor zones.",
    iconName: "wifi",
    category: "comfort",
  },
  {
    id: "ac",
    name: "Climate Control AC",
    description: "Whisper-quiet dual climate control in all suites and living spaces.",
    iconName: "ac",
    category: "comfort",
  },
  {
    id: "parking",
    name: "Private Secure Parking",
    description: "Gated private parking area with valet and EV charging infrastructure.",
    iconName: "parking",
    category: "service",
  },
  {
    id: "housekeeping",
    name: "Daily Butler & Housekeeping",
    description: "Immaculate twice-daily housekeeping service and evening turn-down.",
    iconName: "housekeeping",
    category: "service",
  },
  {
    id: "kitchen",
    name: "Fully-Equipped Gourmet Kitchen",
    description: "Premium appliances, espresso bar, wine cellar, and chef preparation counter.",
    iconName: "kitchen",
    category: "luxury",
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Exterior Infinity Deck at Sunset",
    category: "Architecture",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-2",
    title: "Master Suite Interior & Ocean View",
    category: "Interior",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-3",
    title: "Private Courtyard Pool & Sunbed",
    category: "Poolside",
    imageUrl:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-4",
    title: "Open Lounge & Dining Area",
    category: "Living",
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-5",
    title: "Garden Pavilion & Evening Lighting",
    category: "Outdoors",
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-6",
    title: "Luxury Marble Bathroom Suite",
    category: "Interior",
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
  },
];
