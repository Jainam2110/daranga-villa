import { NextResponse } from "next/server";
import { verifyCustomerFromHeader } from "@/lib/auth/customer";

/**
 * GET /api/customer/profile
 * Retrieve authenticated customer profile details.
 */
export async function GET(request: Request) {
  try {
    const authResult = await verifyCustomerFromHeader(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: "Authentication token required." },
        { status: 401 }
      );
    }

    const { customer } = authResult;

    return NextResponse.json({
      success: true,
      user: {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        firebaseUid: customer.firebaseUid || "",
        role: customer.role,
        authProviders: customer.authProviders || [],
        createdAt: customer.createdAt,
      },
    });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET Customer Profile Error:", error);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customer/profile
 * Update allowed fields (name, phone) on customer profile.
 */
export async function PATCH(request: Request) {
  try {
    const authResult = await verifyCustomerFromHeader(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: "Authentication token required." },
        { status: 401 }
      );
    }

    const { customer } = authResult;

    const body = await request.json().catch(() => ({}));
    const { name, phone, role, firebaseUid, passwordHash, email, bookingStatus, paymentStatus } = body;

    // Reject attempts to mutate forbidden/protected fields explicitly if sent
    if (
      role !== undefined ||
      firebaseUid !== undefined ||
      passwordHash !== undefined ||
      email !== undefined ||
      bookingStatus !== undefined ||
      paymentStatus !== undefined
    ) {
      console.warn(
        `Customer ${customer._id} attempted to modify protected profile fields.`
      );
    }

    // Validate Name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "Full name must be a non-empty string." },
          { status: 400 }
        );
      }
      customer.name = name.trim();
    }

    // Validate Phone
    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return NextResponse.json(
          { success: false, error: "Phone number must be a string." },
          { status: 400 }
        );
      }
      customer.phone = phone.trim();
    }

    await customer.save();

    return NextResponse.json({
      success: true,
      user: {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        firebaseUid: customer.firebaseUid || "",
        role: customer.role,
        authProviders: customer.authProviders || [],
        createdAt: customer.createdAt,
      },
    });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("PATCH Customer Profile Error:", error);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
