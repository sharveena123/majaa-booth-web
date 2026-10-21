import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { subscriberNav } from "@/components/dashboard/dashboard-nav";
import { formValuesToInput, OrderForm, orderToFormValues } from "@/components/orders/OrderForm";
import { useOrganizationId } from "@/hooks/use-org-id";
import { api } from "@/lib/api/client";
import { formatRM, outstandingBalance } from "@/lib/currency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoadingFade } from "@/components/ui/LoadingFade";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const orgId = useOrganizationId();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", orgId, id],
    queryFn: () => api.getOrder(orgId, id),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: (values: ReturnType<typeof orderToFormValues>) =>
      api.updateOrder(orgId, id, formValuesToInput(values)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", orgId, id] });
      qc.invalidateQueries({ queryKey: ["orders", orgId] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics", orgId] });
      qc.invalidateQueries({ queryKey: ["revenue", orgId] });
      toast.success("Order updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteOrder(orgId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", orgId] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics", orgId] });
      qc.invalidateQueries({ queryKey: ["revenue", orgId] });
      toast.success("Order deleted");
      navigate({ to: "/dashboard/orders" });
    },
  });

  return (
    <DashboardLayout variant="subscriber" nav={subscriberNav} title="Order detail" breadcrumb={data?.eventName ?? id}>
      {isError && <p className="text-destructive">Order not found.</p>}
      <LoadingFade loading={isLoading && !data}>
        {data && (
        <div className="space-y-6">
          <div className="glass flex flex-wrap items-center gap-3 rounded-2xl px-5 py-4 text-sm">
            <OrderStatusBadge status={data.status} />
            <span className="text-muted-foreground">{format(parseISO(data.eventDate), "EEEE, d MMMM yyyy")}</span>
            <span>
              Outstanding:{" "}
              <strong className="text-primary-glow">
                {formatRM(outstandingBalance(data.totalPrice, data.deposit))}
              </strong>
            </span>
          </div>
          <div className="glass rounded-2xl p-5">
            <OrderForm
              defaultValues={orderToFormValues(data)}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                await updateMutation.mutateAsync(values);
              }}
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete order</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border bg-deep">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the booking from your CRM and revenue reports. This action cannot be undone in mock mode.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        )}
      </LoadingFade>
    </DashboardLayout>
  );
}
