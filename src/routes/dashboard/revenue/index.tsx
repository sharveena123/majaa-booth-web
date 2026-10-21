import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { subscriberNav } from "@/components/dashboard/dashboard-nav";
import { useOrganizationId } from "@/hooks/use-org-id";
import { api, isMockApi } from "@/lib/api/client";
import { formatRM, outstandingBalance } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingFade } from "@/components/ui/LoadingFade";

export const Route = createFileRoute("/dashboard/revenue/")({
  component: RevenuePage,
});

function RevenuePage() {
  const orgId = useOrganizationId();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["revenue", orgId, from, to],
    queryFn: () =>
      api.getRevenueReport(
        orgId,
        from ? new Date(from).toISOString() : undefined,
        to ? new Date(to).toISOString() : undefined,
      ),
    enabled: !!orgId,
  });

  const showEmpty = !isLoading && !isMockApi && !(data?.orders.length ?? 0);

  const exportCsv = () => {
    const rows = data?.orders ?? [];
    const header = [
      "Event",
      "Client",
      "Date",
      "Status",
      "Total",
      "Deposit",
      "Outstanding",
    ];
    const lines = [
      header.join(","),
      ...rows.map((o) =>
        [
          csv(o.eventName),
          csv(o.clientName),
          format(parseISO(o.eventDate), "yyyy-MM-dd"),
          o.status,
          o.totalPrice,
          o.deposit,
          outstandingBalance(o.totalPrice, o.deposit),
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `majaa-revenue-${orgId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout variant="subscriber" nav={subscriberNav} title="Revenue" breadcrumb="Bookings & collections">
      <p className="mb-4 text-xs text-muted-foreground">
        Cancelled orders are excluded from booked value. Deleted orders are removed entirely. Completed-event revenue counts
        only orders marked completed.
      </p>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="label">From</label>
          <Input type="date" className="mt-2 bg-background/60" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">To</label>
          <Input type="date" className="mt-2 bg-background/60" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button variant="secondary" onClick={exportCsv} disabled={!data?.orders.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <LoadingFade loading={isLoading && !data}>
        {showEmpty ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-background/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Revenue charts and totals appear after you create event bookings with pricing.
          </p>
          <Button asChild className="mt-6 glow-btn">
            <Link to="/dashboard/orders" search={{ create: true }}>
              Create your first order
            </Link>
          </Button>
        </div>
        ) : (
        <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total booked value" value={formatRM(data?.totalBookedValue ?? 0)} icon={Download} />
            <StatCard label="Deposits collected" value={formatRM(data?.depositsCollected ?? 0)} icon={Download} />
            <StatCard label="Outstanding balances" value={formatRM(data?.outstandingBalances ?? 0)} icon={Download} />
            <StatCard label="Completed-event revenue" value={formatRM(data?.completedEventRevenue ?? 0)} icon={Download} />
      </div>

      <section className="glass mt-6 rounded-2xl p-5">
        <h2 className="text-sm font-semibold">Monthly revenue</h2>
        <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlySeries ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.56 0.25 302 / 12%)" />
                <XAxis dataKey="month" tick={{ fill: "oklch(1 0 0 / 52%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "oklch(1 0 0 / 52%)", fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => formatRM(v)}
                  contentStyle={{
                    background: "oklch(0.14 0.04 300)",
                    border: "1px solid oklch(0.56 0.25 302 / 15%)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="amount" fill="oklch(0.56 0.25 302)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </section>

      <section className="glass mt-6 overflow-hidden rounded-2xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Order breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Outstanding</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-border/60">
                <td className="px-5 py-3">{o.eventName}</td>
                <td className="px-5 py-3 text-muted-foreground">{format(parseISO(o.eventDate), "d MMM yyyy")}</td>
                <td className="px-5 py-3">{formatRM(o.totalPrice)}</td>
                <td className="px-5 py-3">{formatRM(outstandingBalance(o.totalPrice, o.deposit))}</td>
                <td className="px-5 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
        </>
        )}
      </LoadingFade>
    </DashboardLayout>
  );
}

function csv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
