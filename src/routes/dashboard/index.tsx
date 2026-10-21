import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays, Monitor, Sparkles, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConnectivityBadge, LockBadge, OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { subscriberNav } from "@/components/dashboard/dashboard-nav";
import { useOrganizationId } from "@/hooks/use-org-id";
import { api, isMockApi } from "@/lib/api/client";
import type { DashboardMetrics } from "@/lib/api/types";
import { formatRM } from "@/lib/currency";
import { LoadingFade } from "@/components/ui/LoadingFade";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverviewPage,
});

function workspaceIsEmpty(data: DashboardMetrics | undefined): boolean {
  if (!data) return false;
  return data.totalMachines === 0 && data.recentOrders.length === 0;
}

function DashboardOverviewPage() {
  const orgId = useOrganizationId();
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-metrics", orgId],
    queryFn: () => api.getDashboardMetrics(orgId),
    enabled: !!orgId,
  });

  const showEmptyHero = !isMockApi && !isLoading && workspaceIsEmpty(data);

  return (
    <DashboardLayout
      variant="subscriber"
      nav={subscriberNav}
      title="Overview"
      breadcrumb={`Welcome back, ${user?.name ?? "there"}`}
    >
      {isError && (
        <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load dashboard metrics.
        </p>
      )}

      <LoadingFade loading={isLoading && !data}>
        {showEmptyHero ? (
          <DashboardEmptyState userName={user?.name} />
        ) : (
          <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Machines" value={String(data?.totalMachines ?? 0)} icon={Monitor} />
                <StatCard
                  label="Online Machines"
                  value={String(data?.onlineMachines ?? 0)}
                  hint={isMockApi ? "Simulated connectivity (demo)" : "From device heartbeats"}
                  icon={Monitor}
                />
                <StatCard label="Upcoming Events" value={String(data?.upcomingEvents ?? 0)} icon={CalendarDays} />
                <StatCard label="Booked Revenue" value={formatRM(data?.bookedRevenue ?? 0)} icon={Wallet} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="Deposits Collected" value={formatRM(data?.depositsCollected ?? 0)} icon={Wallet} />
            <StatCard label="Outstanding Balances" value={formatRM(data?.outstandingBalances ?? 0)} icon={Wallet} />
            <StatCard label="AI Photos Generated" value={String(data?.aiPhotosGenerated ?? 0)} icon={Sparkles} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <section className="glass rounded-2xl p-5 xl:col-span-2">
              <h2 className="text-sm font-semibold">Revenue over time</h2>
              <p className="text-xs text-muted-foreground">Booked vs deposits collected by event month</p>
              <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.revenueSeries ?? []}>
                      <defs>
                        <linearGradient id="booked" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.56 0.25 302)" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="oklch(0.56 0.25 302)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.56 0.25 302 / 12%)" />
                      <XAxis dataKey="month" tick={{ fill: "oklch(1 0 0 / 52%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "oklch(1 0 0 / 52%)", fontSize: 11 }} tickFormatter={(v) => `RM${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.14 0.04 300)",
                          border: "1px solid oklch(0.56 0.25 302 / 15%)",
                          borderRadius: 12,
                        }}
                        formatter={(value: number) => formatRM(value)}
                      />
                      <Area type="monotone" dataKey="booked" stroke="oklch(0.72 0.18 306)" fill="url(#booked)" name="Booked" />
                      <Area type="monotone" dataKey="collected" stroke="oklch(0.84 0.13 322)" fill="transparent" name="Deposits" />
                    </AreaChart>
                  </ResponsiveContainer>
              </div>
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold">Machine status</h2>
              <p className="text-xs text-muted-foreground">
                {isMockApi ? "Read-only · demo heartbeats" : "Linked booths for your organization"}
              </p>
              <ul className="mt-4 space-y-3">
                {(data?.machineSummaries ?? []).map((m) => (
                  <li key={m.id} className="rounded-xl border border-border bg-background/40 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <Link to="/dashboard/machines/$id" params={{ id: m.id }} className="text-sm font-medium hover:text-primary-glow">
                        {m.name}
                      </Link>
                      <ConnectivityBadge status={m.connectivity} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <LockBadge locked={m.locked} />
                      <span className="text-xs text-muted-foreground">{m.aiPhotosGenerated} AI photos</span>
                    </div>
                  </li>
                ))}
                {!data?.machineSummaries.length && (
                  <p className="text-sm text-muted-foreground">No machines linked yet.</p>
                )}
              </ul>
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="glass overflow-hidden rounded-2xl">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold">Recent orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="px-5 py-3 font-medium">Event</th>
                      <th className="px-5 py-3 font-medium">Total</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentOrders ?? []).map((o) => (
                      <tr key={o.id} className="border-b border-border/60">
                        <td className="px-5 py-3">
                          <Link to="/dashboard/orders/$id" params={{ id: o.id }} className="font-medium hover:text-primary-glow">
                            {o.eventName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{format(parseISO(o.eventDate), "d MMM yyyy")}</p>
                        </td>
                        <td className="px-5 py-3">{formatRM(o.totalPrice)}</td>
                        <td className="px-5 py-3">
                          <OrderStatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold">Upcoming events</h2>
              <ul className="mt-4 space-y-3">
                {!(data?.upcomingEventsList ?? []).length && (
                  <li className="text-sm text-muted-foreground">No upcoming events scheduled.</li>
                )}
                {(data?.upcomingEventsList ?? []).map((o) => (
                  <li key={o.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background/40 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{o.eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.clientName} · {format(parseISO(o.eventDate), "EEE, d MMM")}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-primary-glow">{formatRM(o.totalPrice)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          </>
        )}
      </LoadingFade>
    </DashboardLayout>
  );
}
