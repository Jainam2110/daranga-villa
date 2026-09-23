/**
 * Map raw Firebase error codes into friendly user messages.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const errObj = error as { code?: string; message?: string };
  const code = errObj.code || "";
  const msg = errObj.message || "";

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
      return "Google sign-in was cancelled.";

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
      if (msg.includes("reCAPTCHA") || msg.includes("domain")) {
        return "Firebase phone authentication rejected this domain. Please ensure your domain is added to Firebase Authorized Domains.";
      }
      return msg.length > 0 && !msg.includes("Firebase:")
        ? msg
        : "Authentication failed. Please verify your details and try again.";
  }
}
