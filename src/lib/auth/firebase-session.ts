import type { User } from "firebase/auth";
import { getSuperadminEmails } from "@/lib/firebase/config";
import { organizationIdForUser } from "./organization-id";
import type { SessionUser, UserRole } from "./session";

export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Pop-up was blocked. Allow pop-ups for this site and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/unauthorized-domain":
      return "This site is not authorized in Firebase. Add your domain under Authentication → Settings → Authorized domains.";
    case "auth/operation-not-allowed":
      return "This sign-in method is disabled. Enable Google (or Email) in Firebase → Authentication → Sign-in method.";
    case "auth/network-request-failed":
      return [
        "Could not reach Firebase from your browser (not a Wi‑Fi issue in most cases).",
        "• Open the app at http://localhost:8080 — not the 192.168… network URL.",
        "• Google Cloud Console → APIs & Services → Credentials → your Browser API key → HTTP referrers: add http://localhost:8080/* and http://localhost/*",
        "• Temporarily disable ad blockers / VPN for this site, then hard-refresh.",
        "• Firebase Console → Authentication → Sign-in method: Google enabled.",
      ].join("\n");
    default:
      return code ? `Sign-in failed (${code.replace("auth/", "")}).` : "Sign-in failed. Please try again.";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

async function resolveRole(user: User): Promise<UserRole> {
  try {
    const token = await withTimeout(user.getIdTokenResult(), 4000);
    const claim = token.claims.role;
    if (claim === "superadmin" || claim === "subscriber") {
      return claim;
    }
  } catch {
    /* use email fallback */
  }
  const email = user.email?.toLowerCase() ?? "";
  if (getSuperadminEmails().has(email)) {
    return "superadmin";
  }
  return "subscriber";
}

export async function sessionFromFirebaseUser(user: User): Promise<SessionUser> {
  const role = await resolveRole(user);
  const name = user.displayName || user.email?.split("@")[0] || "User";

  return {
    id: user.uid,
    email: user.email ?? "",
    name,
    role,
    organizationId: role === "subscriber" ? organizationIdForUser(user.uid) : undefined,
    isGuest: false,
    authProvider: "firebase",
  };
}
