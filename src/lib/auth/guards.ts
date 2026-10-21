import { redirect } from "@tanstack/react-router";
import { isSessionAllowed } from "./session-policy";
import { getSession, hasRole, setSession, type UserRole } from "./session";

export function requireAuth(redirectTo?: string) {
  const session = getSession();
  if (!isSessionAllowed(session)) {
    if (session) setSession(null);
    throw redirect({
      to: "/login",
      search: redirectTo ? { redirect: redirectTo } : {},
    });
  }
  return session;
}

export function requireRoles(roles: UserRole[], redirectTo?: string) {
  const session = requireAuth(redirectTo);
  if (!hasRole(session, ...roles)) {
    throw redirect({ to: session.role === "superadmin" ? "/admin" : "/dashboard" });
  }
  return session;
}
