import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isMockApi } from "@/lib/api/client";
import type { DeviceConnectivity, OrderStatus } from "@/lib/api/types";

const orderStyles: Record<OrderStatus, string> = {
  inquiry: "bg-muted text-muted-foreground",
  quoted: "bg-primary/15 text-primary-glow",
  confirmed: "bg-primary/25 text-foreground",
  completed: "bg-highlight/20 text-highlight",
  cancelled: "bg-destructive/15 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="secondary" className={cn("capitalize", orderStyles[status])}>
      {status}
    </Badge>
  );
}

export function ConnectivityBadge({ status }: { status: DeviceConnectivity }) {
  const map = {
    online: "bg-primary/20 text-primary-glow",
    stale: "bg-highlight/15 text-highlight",
    offline: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="secondary" className={cn("capitalize", map[status])}>
      {status}
      {isMockApi && status !== "offline" && " (demo)"}
    </Badge>
  );
}

export function LockBadge({ locked }: { locked: boolean }) {
  return (
    <Badge variant="secondary" className={locked ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary-glow"}>
      {locked ? "Locked" : "Unlocked"}
    </Badge>
  );
}
