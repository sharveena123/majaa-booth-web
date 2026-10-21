# Majaa — Photo Booth Business Platform

Premium photo booth software landing page, subscriber dashboard, and superadmin control panel. Built with React, TanStack Start/Router, Tailwind CSS, and a typed mock API for local development.

## Requirements

- Node.js 18+
- npm

## Installation

```sh
npm install
cp .env.example .env
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Authentication (Firebase + optional mock)

When Firebase env variables are set, the app uses **Firebase Authentication** (email/password and **Google**). Sessions are mirrored to `sessionStorage` for route guards and the mock API.

### Firebase setup (you do this in the console)

1. [Firebase Console](https://console.firebase.google.com/) → **Create a project** (or use an existing one).
2. **Build → Authentication → Get started**.
3. **Sign-in method** → enable **Email/Password** and **Google** (pick a support email for Google).
4. **Project settings** (gear) → **General** → **Your apps** → add a **Web** app if you do not have one.
5. Copy the `firebaseConfig` values into `.env` (see `.env.example`).
6. **Authentication → Settings → Authorized domains** → add:
   - `localhost` (dev)
   - Your production domain (e.g. Lovable / Cloudflare URL)
7. **Google Cloud Console** (same project) → **APIs & Services → Credentials** → open the **Browser key** (auto-created for Firebase) → under **Application restrictions → HTTP referrers**, add:
   - `http://localhost:8080/*` (this app’s dev port)
   - `http://localhost/*`
   - Your production origin(s), e.g. `https://your-domain.com/*`

   If referrers are too strict, the login page shows **network error talking to Firebase** even when your internet is fine. Use **`http://localhost:8080`** in the browser — not the LAN `192.168.x.x` URL — unless you also add that IP to referrers and authorized domains.

Create `.env` from the example and restart `npm run dev` after changing env vars.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_SUPERADMIN_EMAILS=you@yourcompany.com
VITE_ENABLE_MOCK_AUTH=true
```

**Roles:** New users default to **subscriber**. Emails listed in `VITE_FIREBASE_SUPERADMIN_EMAILS` get **superadmin** on sign-in. For production, set custom claims (`role`) with the Firebase Admin SDK instead of relying on env email lists.

### Mock / guest (development)

If Firebase is **not** configured, or you set `VITE_ENABLE_MOCK_AUTH=true`:

- **Continue as guest** on login/signup (subscriber or superadmin).
- Demo email/password (mock only): `demo@snapstudio.my` / `demo1234`, `admin@majaa.app` / `admin1234`.

Set `VITE_ENABLE_MOCK_AUTH=false` when Firebase is ready for production.

Superadmins can open subscriber routes; subscribers cannot access `/admin`.

## Mock API

Set in `.env`:

```env
VITE_USE_MOCK_API=true
```

Seeded data includes 2 organizations, 4 devices, and 10 orders for Snap Studio KL. Device linking demo codes: **123456**, **654321**.

Replace `src/lib/api/client.ts` with real HTTP calls when your backend is ready. Production must enforce tenant isolation, licensing, and secret storage on the server — never in the browser or Vite env vars.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |

## Routes

**Public:** `/`, `/login`, `/signup`, `/privacy`, `/terms`

**Subscriber:** `/dashboard`, `/dashboard/machines`, `/dashboard/orders`, `/dashboard/revenue`, `/dashboard/settings`

**Superadmin:** `/admin`, `/admin/organizations`, `/admin/devices`, `/admin/devices/link`

## Backend integration checklist

- JWT or session auth with role claims
- Organization-scoped orders and machines APIs
- Device claim/replace/delete with pairing codes
- Encrypted R2 credential storage (never return secrets)
- Heartbeat-based online status
- License lock and feature entitlement enforcement on booth clients

## Lovable

This project syncs with [Lovable](https://lovable.dev). Avoid force-pushing rewritten history on the connected branch.
