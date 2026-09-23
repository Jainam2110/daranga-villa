import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  firebaseUid?: string;
  passwordHash?: string;
  role: "ADMIN" | "CUSTOMER";
  authProviders?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: false,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      sparse: true,
      trim: true,
    },
    firebaseUid: {
      type: String,
      required: false,
      sparse: true,
      index: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
      select: false, // Do not return passwordHash by default in queries
    },
    role: {
      type: String,
      enum: ["ADMIN", "CUSTOMER"],
      default: "CUSTOMER",
    },
    authProviders: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model during hot reload in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
