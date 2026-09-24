import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHeroSlide extends Document {
  url: string;
  title: string;
  tagline: string;
  subtitle?: string;
  caption?: string;
  publicId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    url: { type: String, required: true },
    title: { type: String, required: true, default: "Villas For\nLuxury Living" },
    tagline: { type: String, default: "DARANGA SANCTUARIES" },
    subtitle: { type: String, default: "Where timeless heritage meets private modern luxury" },
    caption: { type: String, default: "The Grand Sanctuary Estate" },
    publicId: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeroSlide: Model<IHeroSlide> =
  mongoose.models.HeroSlide || mongoose.model<IHeroSlide>("HeroSlide", HeroSlideSchema);

export default HeroSlide;
