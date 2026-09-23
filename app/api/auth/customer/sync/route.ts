import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  console.log("[CustomerSync] Request received");

  try {
    const authHeader = request.headers.get("authorization");
    const hasAuthHeader = !!(authHeader && authHeader.startsWith("Bearer "));
    console.log("[CustomerSync] Authorization header present:", hasAuthHeader);

    let idToken = hasAuthHeader ? authHeader!.substring(7).trim() : null;

    const body = await request.json().catch(() => ({}));
    if (!idToken && body.idToken && typeof body.idToken === "string") {
      idToken = body.idToken.trim();
    }

    if (!idToken) {
      console.error("[CustomerSync] Missing Firebase ID token");
      console.log("[CustomerSync] Response status: 401");
      return NextResponse.json(
        { success: false, error: "Missing Firebase ID token." },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken);
      console.log("[CustomerSync] Firebase token verification success");
      console.log("[CustomerSync] UID:", decodedToken.uid);
    } catch (verifyErr: unknown) {
      const errMessage =
        verifyErr instanceof Error ? verifyErr.message : String(verifyErr);
      console.error("[CustomerSync] Firebase token verification failure:", errMessage);
      console.log("[CustomerSync] Response status: 401");
      return NextResponse.json(
        {
          success: false,
          error: `Firebase authentication verification failed: ${errMessage}`,
        },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email ? decodedToken.email.toLowerCase().trim() : undefined;
    const phone_number = decodedToken.phone_number || undefined;
    const tokenName = decodedToken.name || undefined;
    const provider = decodedToken.firebase?.sign_in_provider || "password";

    // Safe extraction of name/phone provided in request body as fallbacks if token claims lack them
    const clientName = typeof body.name === "string" ? body.name.trim() : "";
    const clientPhone = typeof body.phone === "string" ? body.phone.trim() : "";

    const finalName =
      clientName ||
      tokenName ||
      (email ? email.split("@")[0] : null) ||
      "Daranga Guest";

    const finalPhone = phone_number || clientPhone || undefined;

    // Connect to MongoDB
    await connectToDatabase();
    console.log("[CustomerSync] MongoDB connected");

    // 1. Check if user already exists by firebaseUid
    let user = (await User.findOne({ firebaseUid: uid })) as IUser | null;

    // 2. If not found by firebaseUid, try to find by email if present
    if (!user && email) {
      user = (await User.findOne({ email })) as IUser | null;
    }

    console.log("[CustomerSync] MongoDB user lookup:", user ? "found" : "not_found");

    if (user) {
      // SECURITY RULE: Never allow Firebase customer authentication to login/modify an ADMIN account!
      if (user.role === "ADMIN") {
        console.warn("[CustomerSync] Target user is ADMIN - rejecting customer sync");
        console.log("[CustomerSync] Response status: 403");
        return NextResponse.json(
          {
            success: false,
            error:
              "This email address belongs to an Administrator account. Please use the Admin Portal at /admin/login.",
          },
          { status: 403 }
        );
      }

      // Update existing customer record safely
      let isUpdated = false;

      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        isUpdated = true;
      }

      if (finalPhone && !user.phone) {
        user.phone = finalPhone;
        isUpdated = true;
      }

      if (finalName && (!user.name || user.name === "Daranga Guest")) {
        user.name = finalName;
        isUpdated = true;
      }

      const existingProviders = user.authProviders || [];
      if (!existingProviders.includes(provider)) {
        user.authProviders = [...existingProviders, provider];
        isUpdated = true;
      }

      if (isUpdated) {
        await user.save();
      }
      console.log("[CustomerSync] Customer updated:", user._id.toString());
    } else {
      // Create new Customer profile in MongoDB with role strictly set to CUSTOMER
      user = await User.create({
        name: finalName,
        email: email,
        phone: finalPhone,
        firebaseUid: uid,
        role: "CUSTOMER", // STRICT SERVER ENFORCEMENT
        authProviders: [provider],
      });
      console.log("[CustomerSync] Customer created:", user._id.toString());
    }

    console.log("[CustomerSync] Response status: 200");
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email || "",
        phone: user.phone || "",
        firebaseUid: user.firebaseUid,
        role: user.role,
        authProviders: user.authProviders || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("[CustomerSync] Server Error:", errMessage);
    console.log("[CustomerSync] Response status: 500");
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
