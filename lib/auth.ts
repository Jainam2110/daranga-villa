import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

export const ADMIN_COOKIE_NAME = "daranga_admin_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is missing or empty. Please define JWT_SECRET in .env.local or server environment."
    );
  }
  return new TextEncoder().encode(secret.trim());
}

export interface AdminPayload {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN";
}

/**
 * Sign a secure JWT token for an authenticated Admin.
 */
export async function createAdminToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

/**
 * Verify JWT token and confirm ADMIN role.
 */
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "ADMIN") {
      return null;
    }
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as "ADMIN",
    };
  } catch {
    return null;
  }
}

/**
 * Set HTTP-only session cookie for Admin authentication.
 */
export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear Admin session cookie upon logout.
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Get current authenticated admin user from server context.
 */
export async function getAuthenticatedAdmin(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!tokenCookie || !tokenCookie.value) {
    return null;
  }

  const payload = await verifyAdminToken(tokenCookie.value);
  if (!payload) {
    return null;
  }

  // Double check in DB that admin user exists and has ADMIN role
  try {
    await connectToDatabase();
    const user = (await User.findById(payload.userId).lean()) as IUser | null;
    if (!user || user.role !== "ADMIN" || !user.email) {
      return null;
    }
    return {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: "ADMIN",
    };
  } catch {
    return null;
  }
}
