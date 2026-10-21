import { addMonths, format, isAfter, parseISO, startOfMonth } from "date-fns";
import type {
  AdminOverviewMetrics,
  ClaimDeviceInput,
  CloudConfigInput,
  CloudConfigPublic,
  DashboardMetrics,
  Device,
  ExportBundle,
  Order,
  OrderInput,
  Organization,
  ReplaceDeviceInput,
  RevenueReport,
} from "./types";
import {
  activeOrders,
  deviceConnectivity,
  getMockDb,
  resetMockDb,
  saveWorkspaceDb,
  revenueEligibleOrders,
  sumBooked,
  sumCompletedRevenue,
  sumDeposits,
  sumOutstanding,
} from "./mock-store";

function delay(ms = 120): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function notFound(message: string): never {
  throw { code: "NOT_FOUND", message };
}

function badRequest(message: string): never {
  throw { code: "BAD_REQUEST", message };
}

function assertOrgAccess(orgId: string, resourceOrgId: string): void {
  if (orgId !== resourceOrgId) notFound("Resource not found");
}

export const mockApi = {
  async reset(): Promise<void> {
    resetMockDb();
  },

  async ensureSubscriberOrganization(input: {
    orgId: string;
    name: string;
    contactEmail: string;
  }): Promise<Organization> {
    await delay();
    const db = getMockDb();
    const existing = db.organizations.find((o) => o.id === input.orgId);
    if (existing) return existing;
    const org: Organization = {
      id: input.orgId,
      name: input.name,
      contactEmail: input.contactEmail,
      plan: "starter",
      machineAllowance: 2,
      subscriptionStatus: "trialing",
      createdAt: new Date().toISOString(),
      featureEntitlements: { photo: true, video: true, lenticular: false, aiPhotobooth: false },
    };
    db.organizations.push(org);
    db.cloudByOrg[input.orgId] = { configured: false };
    saveWorkspaceDb();
    return org;
  },

  // Organizations
  async listOrganizations(): Promise<Organization[]> {
    await delay();
    return getMockDb().organizations;
  },

  async getOrganization(id: string): Promise<Organization> {
    await delay();
    const existing = getMockDb().organizations.find((o) => o.id === id);
    if (existing) return existing;
    return mockApi.ensureSubscriberOrganization({
      orgId: id,
      name: "My business",
      contactEmail: "owner@local",
    });
  },

  async createOrganization(input: Omit<Organization, "id" | "createdAt">): Promise<Organization> {
    await delay();
    const org: Organization = {
      ...input,
      id: `org-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    getMockDb().organizations.push(org);
    getMockDb().cloudByOrg[org.id] = { configured: false };
    saveWorkspaceDb();
    return org;
  },

  async updateOrganization(id: string, patch: Partial<Organization>): Promise<Organization> {
    await delay();
    const db = getMockDb();
    const idx = db.organizations.findIndex((o) => o.id === id);
    if (idx < 0) notFound("Organization not found");
    db.organizations[idx] = { ...db.organizations[idx], ...patch, id };
    saveWorkspaceDb();
    return db.organizations[idx];
  },

  async getCloudConfig(orgId: string): Promise<CloudConfigPublic> {
    await delay();
    return getMockDb().cloudByOrg[orgId] ?? { configured: false };
  },

  async saveCloudConfig(orgId: string, _input: CloudConfigInput): Promise<CloudConfigPublic> {
    await delay();
    if (!getMockDb().organizations.some((o) => o.id === orgId)) notFound("Organization not found");
    const saved: CloudConfigPublic = {
      configured: true,
      bucketName: _input.bucketName,
      publicGalleryDomain: _input.publicGalleryDomain,
      endpointHint: _input.accountOrEndpoint.replace(/.(?=.{4})/g, "•"),
      updatedAt: new Date().toISOString(),
    };
    getMockDb().cloudByOrg[orgId] = saved;
    saveWorkspaceDb();
    return saved;
  },

  // Devices
  async listDevices(): Promise<Device[]> {
    await delay();
    return getMockDb().devices.filter((d) => d.licenseStatus !== "revoked");
  },

  async listDevicesForOrg(orgId: string): Promise<Device[]> {
    await delay();
    return getMockDb().devices.filter((d) => d.organizationId === orgId && d.licenseStatus !== "revoked");
  },

  async getDevice(id: string): Promise<Device> {
    await delay();
    const device = getMockDb().devices.find((d) => d.id === id && d.licenseStatus !== "revoked");
    if (!device) notFound("Device not found");
    return device;
  },

  async claimDevice(input: ClaimDeviceInput): Promise<Device> {
    await delay();
    if (!/^\d{6}$/.test(input.code)) badRequest("Pairing code must be exactly six digits");
    const db = getMockDb();
    if (!db.organizations.some((o) => o.id === input.organizationId)) badRequest("Invalid organization");
    const codeEntry = db.pairingCodes[input.code];
    if (!codeEntry || isAfter(new Date(), parseISO(codeEntry.expiresAt))) {
      badRequest("Invalid or expired pairing code");
    }
    const existing = db.devices.find((d) => d.pairingCode === input.code && d.licenseStatus === "active");
    if (existing) {
      existing.organizationId = input.organizationId;
      if (input.label) existing.name = input.label;
      delete existing.pairingCode;
      delete db.pairingCodes[input.code];
      saveWorkspaceDb();
      return existing;
    }
    const device: Device = {
      id: `dev-${crypto.randomUUID().slice(0, 8)}`,
      name: input.label ?? `New Booth · ${input.code.slice(-3)}`,
      organizationId: input.organizationId,
      locked: false,
      features: { photo: true, video: true, lenticular: false, aiPhotobooth: false },
      aiPhotosGenerated: 0,
      lastOnlineAt: new Date().toISOString(),
      licenseStatus: "active",
      recentActivity: [{ at: new Date().toISOString(), message: "Device linked" }],
    };
    db.devices.push(device);
    delete db.pairingCodes[input.code];
    saveWorkspaceDb();
    return device;
  },

  async updateDevice(id: string, patch: Partial<Pick<Device, "locked" | "features" | "name">>): Promise<Device> {
    await delay();
    const db = getMockDb();
    const idx = db.devices.findIndex((d) => d.id === id);
    if (idx < 0) notFound("Device not found");
    db.devices[idx] = { ...db.devices[idx], ...patch };
    saveWorkspaceDb();
    return db.devices[idx];
  },

  async replaceDevice(id: string, input: ReplaceDeviceInput): Promise<Device> {
    await delay();
    if (!/^\d{6}$/.test(input.newCode)) badRequest("Replacement code must be exactly six digits");
    const db = getMockDb();
    const old = db.devices.find((d) => d.id === id);
    if (!old) notFound("Device not found");
    const codeEntry = db.pairingCodes[input.newCode];
    if (!codeEntry) badRequest("Invalid or expired pairing code");
    old.licenseStatus = "replaced";
    const replacement: Device = {
      id: `dev-${crypto.randomUUID().slice(0, 8)}`,
      name: `${old.name} (Replacement)`,
      organizationId: old.organizationId,
      locked: old.locked,
      features: { ...old.features },
      aiPhotosGenerated: old.aiPhotosGenerated,
      lastOnlineAt: new Date().toISOString(),
      licenseStatus: "active",
      recentActivity: [
        { at: new Date().toISOString(), message: `Replaced device ${old.id}` },
        ...old.recentActivity,
      ],
    };
    db.devices.push(replacement);
    delete db.pairingCodes[input.newCode];
    saveWorkspaceDb();
    return replacement;
  },

  async deleteDevice(id: string): Promise<void> {
    await delay();
    const db = getMockDb();
    const device = db.devices.find((d) => d.id === id);
    if (!device) notFound("Device not found");
    device.licenseStatus = "revoked";
    saveWorkspaceDb();
  },

  // Orders
  async listOrders(orgId: string): Promise<Order[]> {
    await delay();
    return getMockDb().orders.filter((o) => o.organizationId === orgId);
  },

  async getOrder(orgId: string, id: string): Promise<Order> {
    await delay();
    const order = getMockDb().orders.find((o) => o.id === id);
    if (!order) notFound("Order not found");
    assertOrgAccess(orgId, order.organizationId);
    return order;
  },

  async createOrder(orgId: string, input: OrderInput): Promise<Order> {
    await delay();
    const ts = new Date().toISOString();
    const order: Order = {
      ...input,
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: orgId,
      createdAt: ts,
      updatedAt: ts,
    };
    getMockDb().orders.push(order);
    saveWorkspaceDb();
    return order;
  },

  async updateOrder(orgId: string, id: string, input: Partial<OrderInput>): Promise<Order> {
    await delay();
    const db = getMockDb();
    const idx = db.orders.findIndex((o) => o.id === id);
    if (idx < 0) notFound("Order not found");
    assertOrgAccess(orgId, db.orders[idx].organizationId);
    db.orders[idx] = { ...db.orders[idx], ...input, updatedAt: new Date().toISOString() };
    saveWorkspaceDb();
    return db.orders[idx];
  },

  async deleteOrder(orgId: string, id: string): Promise<void> {
    await delay();
    const db = getMockDb();
    const idx = db.orders.findIndex((o) => o.id === id);
    if (idx < 0) notFound("Order not found");
    assertOrgAccess(orgId, db.orders[idx].organizationId);
    db.orders.splice(idx, 1);
    saveWorkspaceDb();
  },

  async getDashboardMetrics(orgId: string): Promise<DashboardMetrics> {
    await delay();
    const orders = getMockDb().orders.filter((o) => o.organizationId === orgId);
    const devices = getMockDb().devices.filter((d) => d.organizationId === orgId && d.licenseStatus === "active");
    const eligible = revenueEligibleOrders(orders);
    const now = new Date();
    const upcoming = activeOrders(orders).filter(
      (o) => isAfter(parseISO(o.eventDate), now) && o.status !== "completed",
    );

    const months = Array.from({ length: 6 }, (_, i) => startOfMonth(addMonths(now, i - 5)));
    const revenueSeries = months.map((m) => {
      const label = format(m, "MMM yy");
      const booked = eligible
        .filter((o) => format(parseISO(o.eventDate), "yyyy-MM") === format(m, "yyyy-MM"))
        .reduce((s, o) => s + o.totalPrice, 0);
      const collected = eligible
        .filter((o) => format(parseISO(o.eventDate), "yyyy-MM") === format(m, "yyyy-MM"))
        .reduce((s, o) => s + o.deposit, 0);
      return { month: label, booked, collected };
    });

    return {
      totalMachines: devices.length,
      onlineMachines: devices.filter((d) => deviceConnectivity(d.lastOnlineAt) === "online").length,
      upcomingEvents: upcoming.length,
      bookedRevenue: sumBooked(orders),
      depositsCollected: sumDeposits(orders),
      outstandingBalances: sumOutstanding(orders),
      aiPhotosGenerated: devices.reduce((s, d) => s + d.aiPhotosGenerated, 0),
      revenueSeries,
      recentOrders: [...orders].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6),
      upcomingEventsList: upcoming.sort((a, b) => a.eventDate.localeCompare(b.eventDate)).slice(0, 5),
      machineSummaries: devices.map((d) => ({
        id: d.id,
        name: d.name,
        connectivity: deviceConnectivity(d.lastOnlineAt),
        locked: d.locked,
        aiPhotosGenerated: d.aiPhotosGenerated,
      })),
    };
  },

  async getRevenueReport(orgId: string, from?: string, to?: string): Promise<RevenueReport> {
    await delay();
    let orders = getMockDb().orders.filter((o) => o.organizationId === orgId);
    orders = revenueEligibleOrders(orders);
    if (from) orders = orders.filter((o) => o.eventDate >= from);
    if (to) orders = orders.filter((o) => o.eventDate <= to);

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => startOfMonth(addMonths(now, i - 5)));
    const monthlySeries = months.map((m) => ({
      month: format(m, "MMM yy"),
      amount: orders
        .filter((o) => format(parseISO(o.eventDate), "yyyy-MM") === format(m, "yyyy-MM"))
        .reduce((s, o) => s + o.totalPrice, 0),
    }));

    return {
      totalBookedValue: orders.reduce((s, o) => s + o.totalPrice, 0),
      depositsCollected: orders.reduce((s, o) => s + o.deposit, 0),
      outstandingBalances: orders.reduce((s, o) => s + Math.max(0, o.totalPrice - o.deposit), 0),
      completedEventRevenue: sumCompletedRevenue(orders),
      monthlySeries,
      orders: [...orders].sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
    };
  },

  async getAdminOverview(): Promise<AdminOverviewMetrics> {
    await delay();
    const db = getMockDb();
    const devices = db.devices.filter((d) => d.licenseStatus === "active");
    const statuses = devices.map((d) => deviceConnectivity(d.lastOnlineAt));
    return {
      totalOrganizations: db.organizations.length,
      registeredDevices: devices.length,
      onlineDevices: statuses.filter((s) => s === "online").length,
      lockedDevices: devices.filter((d) => d.locked).length,
      totalAiPhotos: devices.reduce((s, d) => s + d.aiPhotosGenerated, 0),
      recentDeviceActivity: devices
        .flatMap((d) =>
          d.recentActivity.map((a) => ({
            deviceId: d.id,
            deviceName: d.name,
            at: a.at,
            message: a.message,
          })),
        )
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 8),
      organizationSummaries: db.organizations.map((o) => ({
        id: o.id,
        name: o.name,
        activeDevices: devices.filter((d) => d.organizationId === o.id).length,
        plan: o.plan,
        status: o.subscriptionStatus,
      })),
      deviceStatusCounts: {
        online: statuses.filter((s) => s === "online").length,
        stale: statuses.filter((s) => s === "stale").length,
        offline: statuses.filter((s) => s === "offline").length,
      },
    };
  },

  async exportSubscriberData(orgId: string): Promise<ExportBundle> {
    await delay();
    const org = await mockApi.getOrganization(orgId);
    const devices = await mockApi.listDevicesForOrg(orgId);
    const orders = await mockApi.listOrders(orgId);
    const cloud = await mockApi.getCloudConfig(orgId);
    return {
      exportedAt: new Date().toISOString(),
      organization: org,
      devices,
      orders,
      cloud,
    };
  },
};

export type MajaaApi = typeof mockApi;
