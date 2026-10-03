import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { getAdminAuth } from "@/lib/firebase/admin";
import mongoose from "mongoose";

export interface VerifiedCustomer {
  customer: IUser;
  decodedToken: { uid: string; email?: string };
}

/**
 * Verify Firebase ID Token from request Authorization header and return matching MongoDB User customer.
 */
export async function verifyCustomerFromHeader(
  request: Request
): Promise<VerifiedCustomer | null> {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!idToken) {
    return null;
  }

  let decodedToken: { uid: string; email?: string; name?: string } | undefined;
  try {
    const verified = await getAdminAuth().verifyIdToken(idToken);
    decodedToken = { uid: verified.uid, email: verified.email, name: verified.name };
  } catch {
    // Fallback for dev mode
    if (process.env.NODE_ENV !== "production") {
      try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString("utf-8")
          );
          if (payload && payload.sub) {
            decodedToken = { uid: payload.sub, email: payload.email, name: payload.name };
          }
        }
      } catch {
        // ignore
      }
    }
  }

  if (!decodedToken || !decodedToken.uid) {
    return null;
  }

  await connectToDatabase();

  let customer = (await User.findOne({
    firebaseUid: decodedToken.uid,
  })) as IUser | null;

  if (!customer && decodedToken.email) {
    customer = (await User.findOne({
      email: decodedToken.email.toLowerCase().trim(),
    })) as IUser | null;
  }

  // Auto-sync customer to MongoDB if valid token present but User doc does not exist yet
  if (!customer) {
    try {
      const cleanEmail = decodedToken.email ? decodedToken.email.toLowerCase().trim() : undefined;
      const defaultName = decodedToken.name || (cleanEmail ? cleanEmail.split("@")[0] : "Guest Customer");

      customer = await User.create({
        name: defaultName,
        email: cleanEmail,
        firebaseUid: decodedToken.uid,
        role: "CUSTOMER",
      });
    } catch {
      // Handle potential race condition during simultaneous creation
      customer = (await User.findOne({
        firebaseUid: decodedToken.uid,
      })) as IUser | null;
      if (!customer && decodedToken.email) {
        customer = (await User.findOne({
          email: decodedToken.email.toLowerCase().trim(),
        })) as IUser | null;
      }
    }
  }

  if (!customer) {
    return null;
  }

  // Ensure firebaseUid is saved on existing customer doc if matched by email
  if (customer && !customer.firebaseUid && decodedToken.uid) {
    customer.firebaseUid = decodedToken.uid;
    await customer.save().catch(() => {});
  }

  return { customer, decodedToken };
}

/**
 * Server-side ownership verification check.
 * Confirms whether a booking belongs to the verified customer.
 */
export function isBookingOwnedByCustomer(
  booking: {
    customerId?: mongoose.Types.ObjectId | string;
    guestEmail?: string;
    guestPhone?: string;
  },
  customer: IUser
): boolean {
  if (booking.customerId && customer._id) {
    if (booking.customerId.toString() === customer._id.toString()) {
      return true;
    }
  }

  if (customer.email && booking.guestEmail) {
    if (booking.guestEmail.trim().toLowerCase() === customer.email.trim().toLowerCase()) {
      return true;
    }
  }

  if (customer.phone && booking.guestPhone) {
    const cleanGuestPhone = booking.guestPhone.replace(/\D/g, "");
    const cleanCustomerPhone = customer.phone.replace(/\D/g, "");
    if (cleanGuestPhone && cleanCustomerPhone && (cleanGuestPhone === cleanCustomerPhone || cleanGuestPhone.endsWith(cleanCustomerPhone) || cleanCustomerPhone.endsWith(cleanGuestPhone))) {
      return true;
    }
  }

  return false;
}

