import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Cpu, Link2, Lock, Sparkles } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { adminNav } from "@/components/dashboard/dashboard-nav";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/admin/")({
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => api.getAdminOverview(),
  });

  const chartData = data
    ? [
        { name: "Online", value: data.deviceStatusCounts.online, fill: "oklch(0.56 0.25 302)" },
        { name: "Stale", value: data.deviceStatusCounts.stale, fill: "oklch(0.84 0.13 322)" },
        { name: "Offline", value: data.deviceStatusCounts.offline, fill: "oklch(0.18 0.04 300)" },
      ]
    : [];

  return (
    <DashboardLayout variant="admin" nav={adminNav} title="Superadmin overview" breadcrumb="Platform operations">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link to="/admin/organizations">Organizations</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link to="/admin/devices">Devices</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="border-border">
          <Link to="/admin/devices/link">
            <Link2 className="mr-2 h-4 w-4" /> Link device
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Organizations" value={String(data?.totalOrganizations ?? 0)} icon={Building2} />
            <StatCard label="Registered devices" value={String(data?.registeredDevices ?? 0)} icon={Cpu} />
            <StatCard label="Online devices" value={String(data?.onlineDevices ?? 0)} hint="Mock heartbeats" icon={Cpu} />
            <StatCard label="Locked devices" value={String(data?.lockedDevices ?? 0)} icon={Lock} />
            <StatCard label="AI photos (total)" value={String(data?.totalAiPhotos ?? 0)} icon={Sparkles} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Device status</h2>
          <div className="mt-4 h-56">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.14 0.04 300)",
                      border: "1px solid oklch(0.56 0.25 302 / 15%)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Organizations</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(data?.organizationSummaries ?? []).map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2">
                <Link to="/admin/organizations/$id" params={{ id: o.id }} className="font-medium hover:text-primary-glow">
                  {o.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {o.activeDevices} devices · {o.plan}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="glass mt-6 rounded-2xl p-5">
        <h2 className="text-sm font-semibold">Recent device activity</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(data?.recentDeviceActivity ?? []).map((a, i) => (
            <li key={`${a.deviceId}-${i}`} className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
              <span>
                <Link to="/admin/devices/$id" params={{ id: a.deviceId }} className="font-medium hover:text-primary-glow">
                  {a.deviceName}
                </Link>{" "}
                — {a.message}
              </span>
              <span className="text-xs text-muted-foreground">{format(parseISO(a.at), "d MMM HH:mm")}</span>
            </li>
          ))}
        </ul>
      </section>
    </DashboardLayout>
  );
}
