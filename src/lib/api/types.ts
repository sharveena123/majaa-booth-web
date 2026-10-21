export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";
export type SubscriptionPlan = "starter" | "professional" | "enterprise";
export type OrderStatus = "inquiry" | "quoted" | "confirmed" | "completed" | "cancelled";
export type DeviceConnectivity = "online" | "stale" | "offline";

export interface FeatureEntitlements {
  photo: boolean;
  video: boolean;
  lenticular: boolean;
  aiPhotobooth: boolean;
}

export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  plan: SubscriptionPlan;
  machineAllowance: number;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  featureEntitlements: FeatureEntitlements;
}

export interface CloudConfigPublic {
  configured: boolean;
  bucketName?: string;
  publicGalleryDomain?: string;
  endpointHint?: string;
  updatedAt?: string;
}

export interface CloudConfigInput {
  accountOrEndpoint: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicGalleryDomain: string;
}

export interface Device {
  id: string;
  name: string;
  organizationId: string;
  locked: boolean;
  features: FeatureEntitlements;
  aiPhotosGenerated: number;
  lastOnlineAt: string;
  licenseStatus: "active" | "revoked" | "replaced";
  pairingCode?: string;
  recentActivity: { at: string; message: string }[];
}

export interface Order {
  id: string;
  organizationId: string;
  clientName: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  packageName: string;
  addOns: string[];
  totalPrice: number;
  deposit: number;
  status: OrderStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderInput = Omit<Order, "id" | "organizationId" | "createdAt" | "updatedAt">;

export interface DashboardMetrics {
  totalMachines: number;
  onlineMachines: number;
  upcomingEvents: number;
  bookedRevenue: number;
  depositsCollected: number;
  outstandingBalances: number;
  aiPhotosGenerated: number;
  revenueSeries: { month: string; booked: number; collected: number }[];
  recentOrders: Order[];
  upcomingEventsList: Order[];
  machineSummaries: {
    id: string;
    name: string;
    connectivity: DeviceConnectivity;
    locked: boolean;
    aiPhotosGenerated: number;
  }[];
}

export interface RevenueReport {
  totalBookedValue: number;
  depositsCollected: number;
  outstandingBalances: number;
  completedEventRevenue: number;
  monthlySeries: { month: string; amount: number }[];
  orders: Order[];
}

export interface AdminOverviewMetrics {
  totalOrganizations: number;
  registeredDevices: number;
  onlineDevices: number;
  lockedDevices: number;
  totalAiPhotos: number;
  recentDeviceActivity: { deviceId: string; deviceName: string; at: string; message: string }[];
  organizationSummaries: {
    id: string;
    name: string;
    activeDevices: number;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
  }[];
  deviceStatusCounts: { online: number; stale: number; offline: number };
}

export interface ClaimDeviceInput {
  code: string;
  organizationId: string;
  label?: string;
}

export interface ReplaceDeviceInput {
  newCode: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ExportBundle {
  exportedAt: string;
  organization: Organization;
  devices: Device[];
  orders: Order[];
  cloud: CloudConfigPublic;
}
