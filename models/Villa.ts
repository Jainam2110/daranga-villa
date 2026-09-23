import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVillaImage {
  url: string;
  publicId?: string;
}

export interface IVilla extends Document {
  name: string;
  slug: string;
  description?: string;
  location?: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
  mapX?: number;
  mapY?: number;
  images: (IVillaImage | string)[];
  pricePerNight: number;
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  houseRules: string[];
  cancellationPolicy?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const VillaSchema = new Schema<IVilla>(
  {
    name: {
      type: String,
      required: [true, "Villa name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Villa slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    zone: {
      type: String,
      default: "Udaipur, Rajasthan",
    },
    latitude: {
      type: Number,
      default: 24.5854,
    },
    longitude: {
      type: Number,
      default: 73.7125,
    },
    mapX: {
      type: Number,
      default: 50,
    },
    mapY: {
      type: Number,
      default: 50,
    },
    images: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price must be a non-negative number"],
    },
    maxGuests: {
      type: Number,
      required: [true, "Max guests is required"],
      min: [1, "Max guests must be at least 1"],
    },
    bedrooms: {
      type: Number,
      default: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
    },
    amenities: {
      type: [String],
      default: [],
    },
    houseRules: {
      type: [String],
      default: [],
    },
    cancellationPolicy: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model during hot reload in development
const Villa: Model<IVilla> =
  mongoose.models.Villa || mongoose.model<IVilla>("Villa", VillaSchema);

export default Villa;
