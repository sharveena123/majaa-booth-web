/** Firebase web app config from Vite env (all VITE_* are public in the browser bundle). */

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function env(name: keyof ImportMetaEnv): string {
  return (import.meta.env[name] ?? "").trim();
}

export function getFirebaseConfig(): FirebasePublicConfig | null {
  const apiKey = env("VITE_FIREBASE_API_KEY");
  const projectId = env("VITE_FIREBASE_PROJECT_ID");
  const appId = env("VITE_FIREBASE_APP_ID");

  if (!apiKey || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain: env("VITE_FIREBASE_AUTH_DOMAIN") || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET") || `${projectId}.appspot.com`,
    messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId,
  };
}

export function isFirebaseAuthEnabled(): boolean {
  return getFirebaseConfig() !== null;
}

/** Until custom claims / Firestore roles exist, these emails get superadmin on sign-in. */
export function getSuperadminEmails(): Set<string> {
  const raw = env("VITE_FIREBASE_SUPERADMIN_EMAILS");
  if (!raw) return new Set(["admin@majaa.app"]);
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Demo/guest login — off by default when Firebase is configured (set VITE_ENABLE_MOCK_AUTH=true to opt in). */
export function isMockAuthEnabled(): boolean {
  if (import.meta.env.VITE_ENABLE_MOCK_AUTH === "false") return false;
  if (import.meta.env.VITE_ENABLE_MOCK_AUTH === "true") return true;
  return !isFirebaseAuthEnabled();
}
