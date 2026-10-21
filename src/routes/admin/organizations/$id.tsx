import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/dashboard-nav";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingFade } from "@/components/ui/LoadingFade";
import { toast } from "sonner";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/api/types";

export const Route = createFileRoute("/admin/organizations/$id")({
  component: OrganizationDetailPage,
});

function OrganizationDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: org, isLoading } = useQuery({
    queryKey: ["organization", id],
    queryFn: () => api.getOrganization(id),
  });

  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.listDevices(),
  });

  const { data: cloud } = useQuery({
    queryKey: ["cloud", id],
    queryFn: () => api.getCloudConfig(id),
  });

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<typeof org>) => api.updateOrganization(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organization", id] });
      toast.success("Organization updated");
    },
  });

  const assigned = (devices ?? []).filter((d) => d.organizationId === id);

  if (!isLoading && !org) {
    return (
      <DashboardLayout variant="admin" nav={adminNav} title="Not found" breadcrumb="">
        <p className="text-destructive">Organization not found.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant="admin" nav={adminNav} title={org?.name ?? "Organization"} breadcrumb="Organization detail">
      <LoadingFade loading={isLoading && !org}>
      {!org ? null : (
      <>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/organizations">← Organizations</Link>
        </Button>
        <Button asChild variant="secondary" size="sm" className="ml-2">
          <Link to="/admin/organizations/$id/cloud" params={{ id }}>Cloud configuration</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Plan & subscription</h2>
          <div className="mt-4 space-y-3">
            <Field label="Contact email">
              <Input
                defaultValue={org.contactEmail}
                className="bg-background/60"
                onBlur={(e) => updateMutation.mutate({ contactEmail: e.target.value })}
              />
            </Field>
            <Field label="Plan">
              <Select
                defaultValue={org.plan}
                onValueChange={(v) => updateMutation.mutate({ plan: v as SubscriptionPlan })}
              >
                <SelectTrigger className="bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                defaultValue={org.subscriptionStatus}
                onValueChange={(v) => updateMutation.mutate({ subscriptionStatus: v as SubscriptionStatus })}
              >
                <SelectTrigger className="bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <p className="text-xs text-muted-foreground">Created {format(parseISO(org.createdAt), "d MMM yyyy")}</p>
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Cloud & AI</h2>
          <p className="mt-2 text-sm">
            R2 status:{" "}
            {cloud?.configured ? (
              <span className="font-semibold text-primary-glow">Configured ✓</span>
            ) : (
              <span className="text-muted-foreground">Not configured</span>
            )}
          </p>
          {cloud?.publicGalleryDomain && (
            <p className="mt-1 text-xs text-muted-foreground">Gallery: {cloud.publicGalleryDomain}</p>
          )}
          <p className="mt-4 text-sm">
            Total AI photos (assigned devices):{" "}
            <strong>{assigned.reduce((s, d) => s + d.aiPhotosGenerated, 0)}</strong>
          </p>
          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feature entitlements</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {Object.entries(org.featureEntitlements).map(([k, v]) => (
              <li key={k} className="flex justify-between capitalize">
                {k.replace("aiPhotobooth", "AI photobooth")}
                <span className={v ? "text-primary-glow" : "text-muted-foreground"}>{v ? "Yes" : "No"}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Assigned devices ({assigned.length})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {assigned.map((d) => (
              <li key={d.id} className="flex justify-between rounded-xl border border-border bg-background/40 px-3 py-2">
                <Link to="/admin/devices/$id" params={{ id: d.id }} className="font-medium hover:text-primary-glow">
                  {d.name}
                </Link>
                <span className="text-xs text-muted-foreground">{d.aiPhotosGenerated} AI photos</span>
              </li>
            ))}
            {!assigned.length && <p className="text-muted-foreground">No devices linked yet.</p>}
          </ul>
        </section>
      </div>
      </>
      )}
      </LoadingFade>
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
