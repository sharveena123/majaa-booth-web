export type UserRole = "subscriber" | "superadmin";

export type AuthProvider = "firebase" | "demo" | "guest";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  isGuest: boolean;
  /** How this session was created — used so Firebase sign-out does not clear guest sessions. */
  authProvider: AuthProvider;
}

const STORAGE_KEY = "majaa_session_v2";

export const DEMO_USERS = {
  subscriber: {
    id: "user-sub-1",
    email: "demo@snapstudio.my",
    password: "demo1234",
    name: "Sharveena",
    role: "subscriber" as const,
    organizationId: "org-snap-studio-kl",
  },
  superadmin: {
    id: "user-admin-1",
    email: "admin@majaa.app",
    password: "admin1234",
    name: "Majaa Admin",
    role: "superadmin" as const,
  },
} as const;

function readRaw(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeSession(JSON.parse(raw) as SessionUser);
  } catch {
    return null;
  }
}

export function getSession(): SessionUser | null {
  return readRaw();
}

export function setSession(user: SessionUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function sessionFromDemo(role: keyof typeof DEMO_USERS, isGuest = false): SessionUser {
  const demo = DEMO_USERS[role];
  return {
    id: demo.id,
    email: demo.email,
    name: demo.name,
    role: demo.role,
    organizationId: "organizationId" in demo ? demo.organizationId : undefined,
    isGuest,
    authProvider: isGuest ? "guest" : "demo",
  };
}

/** Backfill legacy sessions saved before authProvider existed. */
export function normalizeSession(raw: SessionUser): SessionUser {
  if (raw.authProvider) return raw;
  return {
    ...raw,
    authProvider: raw.isGuest ? "guest" : "demo",
  };
}

export function getActiveOrganizationId(session: SessionUser | null): string | null {
  if (!session) return null;
  if (session.organizationId) return session.organizationId;
  if (session.authProvider === "firebase") {
    return `org-${session.id.slice(0, 16)}`;
  }
  if (session.role === "superadmin") return DEMO_USERS.subscriber.organizationId;
  return null;
}

export function hasRole(session: SessionUser | null, ...roles: UserRole[]): boolean {
  return !!session && roles.includes(session.role);
}
