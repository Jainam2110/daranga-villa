import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHeroSlide extends Document {
  url: string;
  title?: string;
  tagline?: string;
  subtitle?: string;
  caption?: string;
  publicId?: string;
  objectPosition?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    url: { type: String, required: true },
    title: { type: String, default: "" },
    tagline: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    caption: { type: String, default: "" },
    publicId: { type: String, default: "" },
    objectPosition: { type: String, default: "center 35%" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeroSlide: Model<IHeroSlide> =
  mongoose.models.HeroSlide || mongoose.model<IHeroSlide>("HeroSlide", HeroSlideSchema);

export default HeroSlide;

