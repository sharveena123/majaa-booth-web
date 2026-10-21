import { isFirebaseAuthEnabled, isMockAuthEnabled } from "@/lib/firebase/config";
import type { SessionUser } from "./session";

/** Whether this stored session should grant access when Firebase is the primary auth. */
export function isSessionAllowed(session: SessionUser | null): session is SessionUser {
  if (!session) return false;
  if (session.authProvider === "firebase") return true;
  if (isFirebaseAuthEnabled() && !isMockAuthEnabled()) return false;
  return true;
}
