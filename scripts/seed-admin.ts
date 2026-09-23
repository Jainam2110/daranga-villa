import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";

// Read .env.local if present
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@darangavilla.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Daranga Estate Admin";

async function seedAdmin() {
  if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI is not set in environment variables or .env.local");
    process.exit(1);
  }

  if (!ADMIN_PASSWORD || !ADMIN_PASSWORD.trim()) {
    console.error("ERROR: ADMIN_PASSWORD is not set in environment variables or .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (existingAdmin) {
      existingAdmin.name = ADMIN_NAME;
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = "ADMIN";
      await existingAdmin.save();
      console.log(`✓ Admin user '${ADMIN_EMAIL}' updated successfully with ADMIN role.`);
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: "ADMIN",
      });
      console.log(`✓ Initial Admin user '${ADMIN_EMAIL}' created successfully.`);
    }

    await mongoose.disconnect();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Failed to seed admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
