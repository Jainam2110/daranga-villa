import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthenticatedAdmin } from "@/lib/auth";
import HeroSlide from "@/models/HeroSlide";
import cloudinary from "@/lib/cloudinary";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const updatedSlide = await HeroSlide.findByIdAndUpdate(
      id,
      {
        ...(body.url && { url: body.url }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.tagline !== undefined && { tagline: body.tagline }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
        ...(body.caption !== undefined && { caption: body.caption }),
        ...(body.order !== undefined && { order: Number(body.order) }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      },
      { new: true }
    );

    if (!updatedSlide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Slide updated successfully",
      slide: {
        _id: String(updatedSlide._id),
        id: String(updatedSlide._id),
        url: updatedSlide.url,
        title: updatedSlide.title,
        tagline: updatedSlide.tagline,
        subtitle: updatedSlide.subtitle,
        caption: updatedSlide.caption,
        publicId: updatedSlide.publicId,
        order: updatedSlide.order,
        isActive: updatedSlide.isActive,
      },
    });
  } catch (error) {
    console.error("PUT /api/admin/hero-slides/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update slide" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const slide = await HeroSlide.findById(id);
    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    // If slide has publicId in Cloudinary, destroy it
    if (slide.publicId) {
      try {
        await cloudinary.uploader.destroy(slide.publicId);
      } catch (cloudErr) {
        console.error("Cloudinary destruction error:", cloudErr);
      }
    }

    await HeroSlide.findByIdAndDelete(id);

    return NextResponse.json({ message: "Slide deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/hero-slides/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete slide" },
      { status: 500 }
    );
  }
}
