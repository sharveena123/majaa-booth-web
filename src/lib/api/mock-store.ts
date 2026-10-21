import { addHours, subDays, subHours } from "date-fns";
import type {
  CloudConfigPublic,
  Device,
  Order,
  Organization,
} from "./types";
import { outstandingBalance } from "../currency";

const now = new Date();

export const seedOrganizations: Organization[] = [
  {
    id: "org-snap-studio-kl",
    name: "Snap Studio KL",
    contactEmail: "hello@snapstudio.my",
    plan: "professional",
    machineAllowance: 3,
    subscriptionStatus: "active",
    createdAt: subDays(now, 420).toISOString(),
    featureEntitlements: { photo: true, video: true, lenticular: true, aiPhotobooth: true },
  },
  {
    id: "org-pixel-events-pg",
    name: "Pixel Events Penang",
    contactEmail: "team@pixelevents.my",
    plan: "starter",
    machineAllowance: 2,
    subscriptionStatus: "active",
    createdAt: subDays(now, 180).toISOString(),
    featureEntitlements: { photo: true, video: true, lenticular: false, aiPhotobooth: false },
  },
];

export const seedDevices: Device[] = [
  {
    id: "dev-booth-a",
    name: "Booth A · KLCC",
    organizationId: "org-snap-studio-kl",
    locked: false,
    features: { photo: true, video: true, lenticular: true, aiPhotobooth: true },
    aiPhotosGenerated: 842,
    lastOnlineAt: subHours(now, 0.5).toISOString(),
    licenseStatus: "active",
    recentActivity: [
      { at: subHours(now, 1).toISOString(), message: "Heartbeat received (mock)" },
      { at: subDays(now, 1).toISOString(), message: "AI session completed — 24 photos" },
    ],
  },
  {
    id: "dev-mirror-01",
    name: "Mirror 01 · Bangsar",
    organizationId: "org-snap-studio-kl",
    locked: false,
    features: { photo: true, video: false, lenticular: false, aiPhotobooth: true },
    aiPhotosGenerated: 312,
    lastOnlineAt: subHours(now, 26).toISOString(),
    licenseStatus: "active",
    recentActivity: [{ at: subHours(now, 26).toISOString(), message: "Stale heartbeat (mock)" }],
  },
  {
    id: "dev-360-pg",
    name: "360 Spin · Gurney",
    organizationId: "org-pixel-events-pg",
    locked: true,
    features: { photo: true, video: true, lenticular: false, aiPhotobooth: false },
    aiPhotosGenerated: 96,
    lastOnlineAt: subDays(now, 3).toISOString(),
    licenseStatus: "active",
    recentActivity: [{ at: subDays(now, 3).toISOString(), message: "Device locked by admin" }],
  },
  {
    id: "dev-roaming",
    name: "Roaming Kit · Unassigned",
    organizationId: "org-pixel-events-pg",
    locked: false,
    features: { photo: true, video: true, lenticular: false, aiPhotobooth: false },
    aiPhotosGenerated: 0,
    lastOnlineAt: subDays(now, 10).toISOString(),
    licenseStatus: "active",
    pairingCode: "654321",
    recentActivity: [],
  },
];

/** Demo pairing codes for Link Device (mock only). */
export const MOCK_PAIRING_CODES: Record<string, { expiresAt: string }> = {
  "123456": { expiresAt: addHours(now, 24).toISOString() },
  "654321": { expiresAt: addHours(now, 24).toISOString() },
};

function seedOrders(): Order[] {
  const org = "org-snap-studio-kl";
  const mk = (
    id: string,
    partial: Omit<Order, "id" | "organizationId" | "createdAt" | "updatedAt"> & { daysFromNow: number },
  ): Order => {
    const { daysFromNow, ...rest } = partial;
    const eventDate = addHours(now, daysFromNow * 24).toISOString();
    const ts = subDays(now, Math.abs(daysFromNow) + 2).toISOString();
    return {
      id,
      organizationId: org,
      ...rest,
      eventDate,
      createdAt: ts,
      updatedAt: ts,
    };
  };

  return [
    mk("ord-1", {
      clientName: "Aisyah & Daniel",
      eventName: "Aisyah & Daniel Wedding",
      eventType: "Wedding",
      packageName: "Premium 4hr",
      addOns: ["Custom backdrop", "Guest book"],
      totalPrice: 4800,
      deposit: 1200,
      status: "confirmed",
      notes: "Venue: KL — outdoor tent",
      daysFromNow: 12,
    }),
    mk("ord-2", {
      clientName: "Petronas HR",
      eventName: "Petronas Annual Dinner",
      eventType: "Corporate",
      packageName: "Corporate Gala",
      addOns: ["Branded overlay", "Live gallery"],
      totalPrice: 8500,
      deposit: 3000,
      status: "confirmed",
      notes: "Requires 2 attendants",
      daysFromNow: 28,
    }),
    mk("ord-3", {
      clientName: "Lim Family",
      eventName: "Lim & Mei Ling Wedding",
      eventType: "Wedding",
      packageName: "Classic 3hr",
      addOns: ["Props kit"],
      totalPrice: 3200,
      deposit: 800,
      status: "quoted",
      notes: "",
      daysFromNow: 45,
    }),
    mk("ord-4", {
      clientName: "TechFest MY",
      eventName: "TechFest Launch Party",
      eventType: "Corporate",
      packageName: "360 Experience",
      addOns: ["AI booth add-on"],
      totalPrice: 6200,
      deposit: 2000,
      status: "inquiry",
      notes: "Asked about AI styles",
      daysFromNow: 60,
    }),
    mk("ord-5", {
      clientName: "Nadia",
      eventName: "Nadia Birthday",
      eventType: "Private",
      packageName: "Birthday Bash",
      addOns: [],
      totalPrice: 1800,
      deposit: 500,
      status: "completed",
      notes: "Completed — gallery delivered",
      daysFromNow: -14,
    }),
    mk("ord-6", {
      clientName: "Hilton KL",
      eventName: "Hilton Bridal Fair",
      eventType: "Exhibition",
      packageName: "Exhibition Day",
      addOns: ["Lead capture"],
      totalPrice: 2400,
      deposit: 2400,
      status: "completed",
      notes: "",
      daysFromNow: -30,
    }),
    mk("ord-7", {
      clientName: "Zara & Imran",
      eventName: "Zara & Imran Engagement",
      eventType: "Wedding",
      packageName: "Classic 3hr",
      addOns: ["Extra hour"],
      totalPrice: 2600,
      deposit: 650,
      status: "cancelled",
      notes: "Client postponed indefinitely",
      daysFromNow: 90,
    }),
    mk("ord-8", {
      clientName: "Maybank Team",
      eventName: "Maybank Team Building",
      eventType: "Corporate",
      packageName: "Team Building",
      addOns: ["Green screen"],
      totalPrice: 3900,
      deposit: 1000,
      status: "confirmed",
      notes: "",
      daysFromNow: 8,
    }),
    mk("ord-9", {
      clientName: "Sarah Chen",
      eventName: "Sarah Graduation",
      eventType: "Private",
      packageName: "Mini 2hr",
      addOns: [],
      totalPrice: 1200,
      deposit: 300,
      status: "quoted",
      notes: "",
      daysFromNow: 20,
    }),
    mk("ord-10", {
      clientName: "EcoWorld",
      eventName: "EcoWorld Property Launch",
      eventType: "Corporate",
      packageName: "Launch Event",
      addOns: ["Branded prints"],
      totalPrice: 7200,
      deposit: 2500,
      status: "confirmed",
      notes: "VIP lounge setup",
      daysFromNow: 35,
    }),
  ];
}

export type MockDb = {
  organizations: Organization[];
  devices: Device[];
  orders: Order[];
  cloudByOrg: Record<string, CloudConfigPublic>;
  pairingCodes: Record<string, { expiresAt: string }>;
};

const WORKSPACE_STORAGE_KEY = "majaa_workspace_v1";

export function isSeededMockData(): boolean {
  return import.meta.env.VITE_USE_MOCK_API !== "false";
}

function emptyDb(): MockDb {
  return {
    organizations: [],
    devices: [],
    orders: [],
    cloudByOrg: {},
    pairingCodes: {},
  };
}

function cloneSeededDb(): MockDb {
  return {
    organizations: structuredClone(seedOrganizations),
    devices: structuredClone(seedDevices),
    orders: structuredClone(seedOrders()),
    cloudByOrg: {
      "org-snap-studio-kl": {
        configured: true,
        bucketName: "snap-studio-kl",
        publicGalleryDomain: "gallery.snapstudio.my",
        endpointHint: "…r2.cloudflarestorage.com",
        updatedAt: subDays(now, 30).toISOString(),
      },
      "org-pixel-events-pg": { configured: false },
    },
    pairingCodes: structuredClone(MOCK_PAIRING_CODES),
  };
}

function loadInitialDb(): MockDb {
  if (isSeededMockData()) return cloneSeededDb();
  if (typeof localStorage === "undefined") return emptyDb();
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    /* fresh workspace */
  }
  return emptyDb();
}

let db: MockDb = loadInitialDb();

export function getMockDb(): MockDb {
  return db;
}

export function saveWorkspaceDb(): void {
  if (isSeededMockData() || typeof localStorage === "undefined") return;
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(db));
}

export function resetMockDb(): void {
  db = isSeededMockData() ? cloneSeededDb() : emptyDb();
  saveWorkspaceDb();
}

export function deviceConnectivity(lastOnlineAt: string): "online" | "stale" | "offline" {
  const diff = now.getTime() - new Date(lastOnlineAt).getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours <= 2) return "online";
  if (hours <= 48) return "stale";
  return "offline";
}

export function activeOrders(orders: Order[]): Order[] {
  return orders.filter((o) => o.status !== "cancelled");
}

export function revenueEligibleOrders(orders: Order[]): Order[] {
  return activeOrders(orders);
}

export function sumOutstanding(orders: Order[]): number {
  return revenueEligibleOrders(orders).reduce(
    (sum, o) => sum + outstandingBalance(o.totalPrice, o.deposit),
    0,
  );
}

export function sumDeposits(orders: Order[]): number {
  return revenueEligibleOrders(orders).reduce((sum, o) => sum + o.deposit, 0);
}

export function sumBooked(orders: Order[]): number {
  return revenueEligibleOrders(orders).reduce((sum, o) => sum + o.totalPrice, 0);
}

export function sumCompletedRevenue(orders: Order[]): number {
  return orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.totalPrice, 0);
}
