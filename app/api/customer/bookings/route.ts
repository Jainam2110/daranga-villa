import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import Booking from "@/models/Booking";
import { getAdminAuth } from "@/lib/firebase/admin";
import "@/models/Villa"; // Ensure Villa model is registered

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "Authentication token required." },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken);
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
              decodedToken = { uid: payload.sub, email: payload.email };
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication token." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find customer in MongoDB
    let customer = (await User.findOne({ firebaseUid: decodedToken.uid })) as IUser | null;

    if (!customer && decodedToken.email) {
      customer = (await User.findOne({ email: decodedToken.email.toLowerCase() })) as IUser | null;
    }

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer profile not found." },
        { status: 444 }
      );
    }

    // Build query to find all bookings belonging to this customer
    const queryConditions: Record<string, unknown>[] = [{ customerId: customer._id }];
    if (customer.email) {
      queryConditions.push({ guestEmail: customer.email.toLowerCase() });
    }
    if (customer.phone) {
      queryConditions.push({ guestPhone: customer.phone });
    }

    const bookings = await Booking.find({ $or: queryConditions })
      .populate("villaId", "title name slug images heroImage address city")
      .sort({ checkIn: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      bookings: bookings.map((b) => ({
        id: b._id.toString(),
        villa: b.villaId || null,
        guestName: b.guestName,
        guestEmail: b.guestEmail,
        guestPhone: b.guestPhone,
        checkIn: b.checkIn.toISOString(),
        checkOut: b.checkOut.toISOString(),
        guests: b.guests,
        totalAmount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        paymentHoldExpiresAt: b.paymentHoldExpiresAt ? b.paymentHoldExpiresAt.toISOString() : undefined,
        razorpayOrderId: b.razorpayOrderId || undefined,
        razorpayPaymentId: b.razorpayPaymentId || undefined,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Customer Bookings API Error:", error);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
