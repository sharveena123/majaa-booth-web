import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/dashboard-nav";
import { api } from "@/lib/api/client";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/organizations/")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => api.listOrganizations(),
  });

  const devicesQuery = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.listDevices(),
  });

  const createMutation = useMutation({
    mutationFn: api.createOrganization,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      setCreateOpen(false);
      toast.success("Organization created");
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? []).filter(
      (o) => !q || o.name.toLowerCase().includes(q) || o.contactEmail.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <DashboardLayout variant="admin" nav={adminNav} title="Organizations" breadcrumb="Tenant management">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Input
          placeholder="Search organizations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-background/60"
        />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New organization
        </Button>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Organization</th>
              <th className="px-5 py-3 hidden md:table-cell">Plan</th>
              <th className="px-5 py-3">Devices</th>
              <th className="px-5 py-3 hidden lg:table-cell">Allowance</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 hidden sm:table-cell">Created</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              filtered.map((o) => {
                const activeDevices = (devicesQuery.data ?? []).filter((d) => d.organizationId === o.id).length;
                return (
                  <tr key={o.id} className="border-b border-border/60">
                    <td className="px-5 py-3">
                      <Link
                        to="/admin/organizations/$id"
                        params={{ id: o.id }}
                        className="font-medium hover:text-primary-glow"
                      >
                        {o.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{o.contactEmail}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell capitalize">{o.plan}</td>
                    <td className="px-5 py-3">{activeDevices}</td>
                    <td className="px-5 py-3 hidden lg:table-cell">{o.machineAllowance}</td>
                    <td className="px-5 py-3 capitalize">{o.subscriptionStatus.replace("_", " ")}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-muted-foreground">
                      {format(parseISO(o.createdAt), "d MMM yyyy")}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <CreateOrgDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
      />
    </DashboardLayout>
  );
}

function CreateOrgDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (payload: {
    name: string;
    contactEmail: string;
    plan: SubscriptionPlan;
    machineAllowance: number;
    subscriptionStatus: SubscriptionStatus;
    featureEntitlements: { photo: boolean; video: boolean; lenticular: boolean; aiPhotobooth: boolean };
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<SubscriptionPlan>("starter");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-deep sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Organization name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/60" />
          <Input placeholder="Contact email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/60" />
          <Select value={plan} onValueChange={(v) => setPlan(v as SubscriptionPlan)}>
            <SelectTrigger className="bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="w-full"
            onClick={() =>
              onCreate({
                name,
                contactEmail: email,
                plan,
                machineAllowance: plan === "enterprise" ? 10 : plan === "professional" ? 3 : 1,
                subscriptionStatus: "active",
                featureEntitlements: { photo: true, video: true, lenticular: plan !== "starter", aiPhotobooth: plan === "enterprise" },
              })
            }
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
