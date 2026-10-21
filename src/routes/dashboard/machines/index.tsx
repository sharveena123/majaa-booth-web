import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ConnectivityBadge, LockBadge } from "@/components/dashboard/StatusBadge";
import { subscriberNav } from "@/components/dashboard/dashboard-nav";
import { useOrganizationId } from "@/hooks/use-org-id";
import { api } from "@/lib/api/client";
import { deviceConnectivity } from "@/lib/api/mock-store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/machines/")({
  component: MachinesPage,
});

function MachinesPage() {
  const orgId = useOrganizationId();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["machines", orgId],
    queryFn: () => api.listDevicesForOrg(orgId),
    enabled: !!orgId,
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
      const conn = deviceConnectivity(d.lastOnlineAt);
      const matchStatus = statusFilter === "all" || conn === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  return (
    <DashboardLayout variant="subscriber" nav={subscriberNav} title="Machines" breadcrumb="Authorized devices (read-only)">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search machines…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-background/60"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full max-w-xs bg-background/60">
            <SelectValue placeholder="Connectivity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All connectivity</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="stale">Stale</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Machine</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Lock</th>
              <th className="px-5 py-3 hidden md:table-cell">Features</th>
              <th className="px-5 py-3 hidden lg:table-cell">AI photos</th>
              <th className="px-5 py-3 hidden sm:table-cell">Last online</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-3">
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))}
            {!isLoading &&
              filtered.map((d) => {
                const conn = deviceConnectivity(d.lastOnlineAt);
                const features = Object.entries(d.features)
                  .filter(([, on]) => on)
                  .map(([k]) => k.replace("aiPhotobooth", "AI"))
                  .join(", ");
                return (
                  <tr key={d.id} className="border-b border-border/60">
                    <td className="px-5 py-3">
                      <Link to="/dashboard/machines/$id" params={{ id: d.id }} className="font-medium hover:text-primary-glow">
                        {d.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{d.id}</p>
                    </td>
                    <td className="px-5 py-3">
                      <ConnectivityBadge status={conn} />
                    </td>
                    <td className="px-5 py-3">
                      <LockBadge locked={d.locked} />
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-xs text-muted-foreground">{features || "—"}</td>
                    <td className="px-5 py-3 hidden lg:table-cell">{d.aiPhotosGenerated}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                      {format(parseISO(d.lastOnlineAt), "d MMM yyyy, HH:mm")}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {!isLoading && !filtered.length && (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            {(data ?? []).length === 0
              ? "No booths linked yet. Pair a device after installation to see it here."
              : "No machines match your filters."}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
