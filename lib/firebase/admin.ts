import { createRemoteJWKSet, jwtVerify } from "jose";

// Google's public JWKS endpoint for cryptographically verifying Firebase Auth ID tokens
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export interface DecodedFirebaseToken {
  uid: string;
  email?: string;
  name?: string;
  phone_number?: string;
  picture?: string;
  firebase?: {
    sign_in_provider?: string;
    [key: string]: unknown;
  };
  sub: string;
  aud: string;
  iss: string;
  [key: string]: unknown;
}

/**
 * Verify a Firebase client ID token using Google's public JWKS.
 * Zero native dependencies, safe for any Node / Serverless / Edge runtime.
 */
export async function verifyFirebaseIdToken(
  token: string
): Promise<DecodedFirebaseToken> {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "daranga-villa";

  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid = payload.sub || "";
  if (!uid) {
    throw new Error("Invalid token payload: missing sub (uid)");
  }

  return {
    ...payload,
    uid,
    email: typeof payload.email === "string" ? payload.email : undefined,
    sub: uid,
    aud: typeof payload.aud === "string" ? payload.aud : projectId,
    iss:
      typeof payload.iss === "string"
        ? payload.iss
        : `https://securetoken.google.com/${projectId}`,
  };
}

export interface AdminAuthAdapter {
  verifyIdToken(token: string): Promise<DecodedFirebaseToken>;
}

/**
 * Lightweight, zero-native-dependency adapter mimicking Firebase Admin Auth.
 * Safe for all Node/Serverless/Edge runtimes without heavy SDK bundling failures.
 */
export function getAdminAuth(): AdminAuthAdapter {
  return {
    verifyIdToken: async (idToken: string): Promise<DecodedFirebaseToken> => {
      return verifyFirebaseIdToken(idToken);
    },
  };
}
