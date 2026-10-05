import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthenticatedAdmin } from "@/lib/auth";
import HeroSlide from "@/models/HeroSlide";
import { INITIAL_HERO_SLIDES } from "@/lib/api/hero-slides";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    let slides = await HeroSlide.find({}).sort({ order: 1, createdAt: 1 }).lean();

    if (!slides || slides.length === 0) {
      // Seed default slides if collection is completely empty
      await HeroSlide.insertMany(INITIAL_HERO_SLIDES);
      slides = await HeroSlide.find({}).sort({ order: 1, createdAt: 1 }).lean();
    }

    return NextResponse.json({
      slides: slides.map((s) => ({
        _id: String(s._id),
        id: String(s._id),
        url: s.url,
        title: s.title,
        tagline: s.tagline,
        subtitle: s.subtitle,
        caption: s.caption,
        publicId: s.publicId,
        objectPosition: s.objectPosition || "center 35%",
        order: s.order ?? 0,
        isActive: s.isActive ?? true,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/hero-slides error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url, title, tagline, subtitle, caption, publicId, objectPosition, order, isActive } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const maxOrderSlide = await HeroSlide.findOne({}).sort({ order: -1 }).lean();
    const nextOrder = order !== undefined ? Number(order) : (maxOrderSlide?.order ?? 0) + 1;

    const newSlide = await HeroSlide.create({
      url: url.trim(),
      title: title !== undefined ? String(title).trim() : "",
      tagline: tagline !== undefined ? String(tagline).trim() : "",
      subtitle: subtitle !== undefined ? String(subtitle).trim() : "",
      caption: caption !== undefined ? String(caption).trim() : "",
      publicId: publicId || "",
      objectPosition: objectPosition || "center 35%",
      order: nextOrder,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json(
      {
        message: "Hero slide added successfully",
        slide: {
          _id: String(newSlide._id),
          id: String(newSlide._id),
          url: newSlide.url,
          title: newSlide.title,
          tagline: newSlide.tagline,
          subtitle: newSlide.subtitle,
          caption: newSlide.caption,
          publicId: newSlide.publicId,
          objectPosition: newSlide.objectPosition,
          order: newSlide.order,
          isActive: newSlide.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/hero-slides error:", error);
    return NextResponse.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slides } = body;

    if (!Array.isArray(slides)) {
      return NextResponse.json(
        { error: "Invalid payload, array of slides expected" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Batch update slide orders and statuses
    const updatePromises = slides.map((slide, index) => {
      const slideId = slide._id || slide.id;
      if (!slideId) return Promise.resolve(null);

      return HeroSlide.findByIdAndUpdate(
        slideId,
        {
          url: slide.url,
          title: slide.title,
          tagline: slide.tagline,
          subtitle: slide.subtitle,
          caption: slide.caption,
          order: index,
          isActive: slide.isActive !== undefined ? Boolean(slide.isActive) : true,
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    const updatedSlides = await HeroSlide.find({}).sort({ order: 1, createdAt: 1 }).lean();

    return NextResponse.json({
      message: "Hero slides updated successfully",
      slides: updatedSlides.map((s) => ({
        _id: String(s._id),
        id: String(s._id),
        url: s.url,
        title: s.title,
        tagline: s.tagline,
        subtitle: s.subtitle,
        caption: s.caption,
        publicId: s.publicId,
        objectPosition: s.objectPosition || "center 35%",
        order: s.order ?? 0,
        isActive: s.isActive ?? true,
      })),
    });
  } catch (error) {
    console.error("PUT /api/admin/hero-slides error:", error);
    return NextResponse.json(
      { error: "Failed to update hero slides" },
      { status: 500 }
    );
  }
}
