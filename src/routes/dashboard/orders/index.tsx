import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { subscriberNav } from "@/components/dashboard/dashboard-nav";
import { formValuesToInput, OrderForm, type OrderFormValues } from "@/components/orders/OrderForm";
import { useOrganizationId } from "@/hooks/use-org-id";
import { api } from "@/lib/api/client";
import type { OrderStatus } from "@/lib/api/types";
import { formatRM, outstandingBalance } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const searchSchema = z.object({
  create: z.coerce.boolean().optional(),
});

export const Route = createFileRoute("/dashboard/orders/")({
  validateSearch: (search) => searchSchema.parse(search),
  component: OrdersPage,
});

const emptyOrder: OrderFormValues = {
  clientName: "",
  eventName: "",
  eventType: "",
  eventDate: new Date().toISOString().slice(0, 10),
  packageName: "",
  addOns: "",
  totalPrice: 0,
  deposit: 0,
  status: "inquiry",
  notes: "",
};

function OrdersPage() {
  const { create: openCreateFromUrl } = Route.useSearch();
  const orgId = useOrganizationId();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (openCreateFromUrl) setCreateOpen(true);
  }, [openCreateFromUrl]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", orgId],
    queryFn: () => api.listOrders(orgId),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (values: OrderFormValues) => api.createOrder(orgId, formValuesToInput(values)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", orgId] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics", orgId] });
      qc.invalidateQueries({ queryKey: ["revenue", orgId] });
      setCreateOpen(false);
      toast.success("Order created");
    },
  });

  const sorted = useMemo(() => {
    return [...(data ?? [])]
      .filter((o) => {
        const q = search.toLowerCase();
        const matchQ =
          !q ||
          o.clientName.toLowerCase().includes(q) ||
          o.eventName.toLowerCase().includes(q) ||
          o.eventType.toLowerCase().includes(q);
        const matchStatus = status === "all" || o.status === status;
        return matchQ && matchStatus;
      })
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  }, [data, search, status]);

  return (
    <DashboardLayout variant="subscriber" nav={subscriberNav} title="Orders" breadcrumb="Your event CRM">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm bg-background/60"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full max-w-xs bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(["inquiry", "quoted", "confirmed", "completed", "cancelled"] as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New order
        </Button>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3 hidden md:table-cell">Date</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3 hidden sm:table-cell">Outstanding</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              sorted.map((o) => (
                <tr key={o.id} className="border-b border-border/60">
                  <td className="px-5 py-3">
                    <Link to="/dashboard/orders/$id" params={{ id: o.id }} className="font-medium hover:text-primary-glow">
                      {o.eventName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{o.clientName}</p>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-muted-foreground">
                    {format(parseISO(o.eventDate), "d MMM yyyy")}
                  </td>
                  <td className="px-5 py-3">{formatRM(o.totalPrice)}</td>
                  <td className="px-5 py-3 hidden sm:table-cell">{formatRM(outstandingBalance(o.totalPrice, o.deposit))}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!isLoading && !sorted.length && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No orders yet — add your first event booking.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create order
            </Button>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-deep sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create order</DialogTitle>
          </DialogHeader>
          <OrderForm
            defaultValues={emptyOrder}
            submitLabel="Create order"
            onCancel={() => setCreateOpen(false)}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
