import {
  Building2,
  Cpu,
  LayoutDashboard,
  Link2,
  MonitorSmartphone,
  Settings,
  ShoppingBag,
  Wallet,
} from "lucide-react";

export const subscriberNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/machines", label: "Machines", icon: MonitorSmartphone },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/revenue", label: "Revenue", icon: Wallet },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export const adminNav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/organizations", label: "Organizations", icon: Building2 },
  { to: "/admin/devices", label: "Devices", icon: Cpu },
  { to: "/admin/devices/link", label: "Link Device", icon: Link2 },
] as const;
