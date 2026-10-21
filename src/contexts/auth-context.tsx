import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { mapFirebaseAuthError, sessionFromFirebaseUser } from "@/lib/auth/firebase-session";
import { organizationIdForUser } from "@/lib/auth/organization-id";
import { provisionSubscriberWorkspace } from "@/lib/auth/provision-workspace";
import { isSessionAllowed } from "@/lib/auth/session-policy";
import {
  DEMO_USERS,
  getSession,
  sessionFromDemo,
  setSession,
  type SessionUser,
  type UserRole,
} from "@/lib/auth/session";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseAuthEnabled, isMockAuthEnabled } from "@/lib/firebase/config";

type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  firebaseEnabled: boolean;
  mockAuthEnabled: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  loginWithGoogle: () => Promise<
    { ok: true; redirect?: boolean } | { ok: false; error: string }
  >;
  continueAsGuest: (role: UserRole) => void;
  demoLogin: (role: keyof typeof DEMO_USERS) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function firebaseAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth is not configured");
  return auth;
}

async function persistFirebaseUser(fbUser: User, businessName?: string) {
  const session = await sessionFromFirebaseUser(fbUser);
  setSession(session);
  if (session.role === "subscriber") {
    await provisionSubscriberWorkspace({
      userId: session.id,
      email: session.email,
      name: session.name,
      businessName,
    });
    const updated = getSession();
    if (updated) setSession(updated);
    return updated ?? session;
  }
  return session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseEnabled = isFirebaseAuthEnabled();
  const mockAuthEnabled = isMockAuthEnabled();
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (typeof window === "undefined") return null;
    const session = getSession();
    return isSessionAllowed(session) ? session : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.authProvider === "firebase" && session.role === "subscriber") {
      const orgId = organizationIdForUser(session.id);
      if (session.organizationId !== orgId) {
        setSession({ ...session, organizationId: orgId });
        setUser({ ...session, organizationId: orgId });
      }
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    setIsLoading(true);

    void getRedirectResult(auth)
      .then(async (cred) => {
        if (cred?.user) {
          const session = await persistFirebaseUser(cred.user);
          setUser(session);
        }
      })
      .catch(() => {
        /* ignore */
      });

    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        setIsLoading(false);
      }
    };

    const safety = window.setTimeout(finish, 5000);

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      void (async () => {
        try {
          if (fbUser) {
            const session = await persistFirebaseUser(fbUser);
            setUser(session);
          } else {
            const existing = getSession();
            if (isSessionAllowed(existing)) {
              setUser(existing);
            } else {
              if (existing) setSession(null);
              setUser(null);
            }
          }
        } catch {
          setSession(null);
          setUser(null);
        } finally {
          window.clearTimeout(safety);
          finish();
        }
      })();
    });

    return () => {
      window.clearTimeout(safety);
      unsub();
    };
  }, [firebaseEnabled]);

  const syncFirebaseUser = useCallback(async (businessName?: string) => {
    const auth = getFirebaseAuth();
    const fbUser = auth?.currentUser;
    if (!fbUser) return null;
    const session = await persistFirebaseUser(fbUser, businessName);
    setUser(session);
    return session;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (firebaseEnabled) {
        try {
          await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
          await syncFirebaseUser();
          return { ok: true as const };
        } catch (err: unknown) {
          const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
          return { ok: false as const, error: mapFirebaseAuthError(code) };
        }
      }

      if (!mockAuthEnabled) {
        return { ok: false as const, error: "Firebase is not configured. Add env variables and restart the dev server." };
      }

      const normalized = email.trim().toLowerCase();
      for (const key of Object.keys(DEMO_USERS) as (keyof typeof DEMO_USERS)[]) {
        const demo = DEMO_USERS[key];
        if (demo.email === normalized && demo.password === password) {
          const session = sessionFromDemo(key, false);
          setSession(session);
          setUser(session);
          return { ok: true as const };
        }
      }
      return { ok: false as const, error: "Invalid email or password (mock auth only)." };
    },
    [firebaseEnabled, mockAuthEnabled, syncFirebaseUser],
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!firebaseEnabled) {
        return {
          ok: false as const,
          error: "Account creation requires Firebase. Configure .env and enable Email/Password in the Firebase console.",
        };
      }
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
          await cred.user.reload();
        }
        await persistFirebaseUser(cred.user, displayName.trim());
        const session = getSession();
        if (session) setUser(session);
        return { ok: true as const };
      } catch (err: unknown) {
        const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
        return { ok: false as const, error: mapFirebaseAuthError(code) };
      }
    },
    [firebaseEnabled],
  );

  const loginWithGoogle = useCallback(async () => {
    if (!firebaseEnabled) {
      return { ok: false as const, error: "Google sign-in requires Firebase configuration." };
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const auth = firebaseAuth();

    try {
      await signInWithPopup(auth, provider);
      await syncFirebaseUser();
      return { ok: true as const };
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      if (
        code === "auth/network-request-failed" ||
        code === "auth/popup-blocked" ||
        code === "auth/cancelled-popup-request"
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return { ok: true as const, redirect: true };
        } catch (redirectErr: unknown) {
          const redirectCode =
            redirectErr && typeof redirectErr === "object" && "code" in redirectErr
              ? String(redirectErr.code)
              : "";
          return { ok: false as const, error: mapFirebaseAuthError(redirectCode || code) };
        }
      }
      return { ok: false as const, error: mapFirebaseAuthError(code) };
    }
  }, [firebaseEnabled, syncFirebaseUser]);

  const continueAsGuest = useCallback(
    (role: UserRole) => {
      if (!mockAuthEnabled) return;
      const key = role === "superadmin" ? "superadmin" : "subscriber";
      const session = sessionFromDemo(key, true);
      setSession(session);
      setUser(session);
    },
    [mockAuthEnabled],
  );

  const demoLogin = useCallback(
    (role: keyof typeof DEMO_USERS) => {
      if (!mockAuthEnabled) return;
      const session = sessionFromDemo(role, false);
      setSession(session);
      setUser(session);
    },
    [mockAuthEnabled],
  );

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        /* still clear local session */
      }
    }
    setSession(null);
    setUser(null);
    window.location.href = "/";
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      firebaseEnabled,
      mockAuthEnabled,
      login,
      signUp,
      loginWithGoogle,
      continueAsGuest,
      demoLogin,
      logout,
    }),
    [user, isLoading, firebaseEnabled, mockAuthEnabled, login, signUp, loginWithGoogle, continueAsGuest, demoLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
