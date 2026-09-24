/**
 * Map raw Firebase error codes into friendly, actionable user messages.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const errObj = error as { code?: string; message?: string };
  const code = errObj.code || "";
  const msg = errObj.message || "";

  console.error("Firebase Auth Error Details:", { code, message: msg, error });

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Email or password is incorrect.";

    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";

    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";

    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";

    case "auth/popup-blocked":
      return "The sign-in popup was blocked by your browser. Please allow popups for this site.";

    case "auth/unauthorized-domain":
      return "This domain is not authorized for Firebase Authentication. Please add this domain to Authorized Domains in your Firebase Console (Authentication > Settings > Authorized domains).";

    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled. Please enable Email/Password (or Google) in your Firebase Console (Authentication > Sign-in method).";

    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":
      return "Firebase API Key is missing or invalid. Please check NEXT_PUBLIC_FIREBASE_API_KEY in your environment variables.";

    case "auth/project-not-found":
    case "auth/configuration-not-found":
      return "Firebase Project configuration not found. Please verify your NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable.";

    case "auth/invalid-verification-code":
    case "auth/invalid-code":
      return "That verification code is incorrect. Please check and try again.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";

    case "auth/network-request-failed":
      return "Unable to connect. Please check your internet connection and try again.";

    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address using a different sign-in method.";

    case "auth/captcha-check-failed":
    case "auth/invalid-app-credential":
      return "reCAPTCHA verification failed or domain is not authorized in Firebase Console.";

    default:
      if (msg.includes("API key not valid") || msg.includes("invalid-api-key")) {
        return "Firebase API Key is invalid. Please configure NEXT_PUBLIC_FIREBASE_API_KEY in your Vercel Environment Variables.";
      }
      if (msg.includes("unauthorized-domain") || msg.includes("domain")) {
        return "This domain is not authorized. Please add your domain to Firebase Console > Authentication > Settings > Authorized domains.";
      }
      if (msg.includes("operation-not-allowed")) {
        return "Sign-in provider is not enabled in Firebase Console (Authentication > Sign-in method).";
      }
      return msg.length > 0 && !msg.includes("Firebase:")
        ? msg
        : "Authentication failed. Please verify your credentials and ensure your environment variables are configured.";
  }
}
