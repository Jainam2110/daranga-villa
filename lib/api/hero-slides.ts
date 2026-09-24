import { connectToDatabase } from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";

export interface HeroSlideData {
  _id?: string;
  id?: string;
  url: string;
  title: string;
  tagline: string;
  subtitle?: string;
  caption?: string;
  publicId?: string;
  order: number;
  isActive: boolean;
}

export const INITIAL_HERO_SLIDES: Omit<HeroSlideData, "_id" | "id">[] = [
  {
    url: "/images/hero/heroimg.webp",
    tagline: "DARANGA SANCTUARIES",
    title: "Villas For\nLuxury Living",
    subtitle: "Where timeless heritage meets private modern luxury",
    caption: "The Grand Sanctuary Estate",
    order: 0,
    isActive: true,
  },
  {
    url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2070&q=85",
    tagline: "PRIVATE INFINITY POOLS",
    title: "Villas With\nPrivate Pools",
    subtitle: "Serene aquatic escapes enveloped by tranquil nature",
    caption: "Infinity Twilight Pools",
    order: 1,
    isActive: true,
  },
  {
    url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2074&q=85",
    tagline: "BESPOKE ARCHITECTURE",
    title: "Bespoke\nArchitecture",
    subtitle: "Handcrafted stone, soaring ceilings & sunlit spaces",
    caption: "Architectural Pavilions",
    order: 2,
    isActive: true,
  },
  {
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2070&q=85",
    tagline: "SECLUDED RETREAT",
    title: "Secluded\nNature Retreats",
    subtitle: "Bespoke privacy amidst Udaipur's peaceful valleys",
    caption: "Secluded Tropical Grounds",
    order: 3,
    isActive: true,
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=85",
    tagline: "SUNSET VERANDAS",
    title: "Sunset &\nStarlit Evenings",
    subtitle: "Unwind under the evening sky in absolute tranquility",
    caption: "Sunset Verandas & Lounges",
    order: 4,
    isActive: true,
  },
];

export async function getActiveHeroSlides(): Promise<HeroSlideData[]> {
  try {
    await connectToDatabase();
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

    if (slides && slides.length > 0) {
      return slides.map((s) => ({
        _id: String(s._id),
        id: String(s._id),
        url: s.url,
        title: s.title || "Villas For\nLuxury Living",
        tagline: s.tagline || "DARANGA SANCTUARIES",
        subtitle: s.subtitle || "",
        caption: s.caption || s.title || "",
        publicId: s.publicId || "",
        order: s.order ?? 0,
        isActive: s.isActive ?? true,
      }));
    }

    // If database is empty, seed initial slides
    try {
      const seeded = await HeroSlide.insertMany(INITIAL_HERO_SLIDES);
      return seeded.map((s) => ({
        _id: String(s._id),
        id: String(s._id),
        url: s.url,
        title: s.title,
        tagline: s.tagline,
        subtitle: s.subtitle,
        caption: s.caption,
        publicId: s.publicId,
        order: s.order,
        isActive: s.isActive,
      }));
    } catch {
      return INITIAL_HERO_SLIDES.map((s, idx) => ({ ...s, id: `init-${idx}` }));
    }
  } catch (error) {
    console.error("Failed to fetch active hero slides:", error);
    return INITIAL_HERO_SLIDES.map((s, idx) => ({ ...s, id: `fallback-${idx}` }));
  }
}
