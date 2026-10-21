import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ConnectivityBadge, LockBadge } from "@/components/dashboard/StatusBadge";
import { adminNav } from "@/components/dashboard/dashboard-nav";
import { api } from "@/lib/api/client";
import { deviceConnectivity } from "@/lib/api/mock-store";
import type { FeatureEntitlements } from "@/lib/api/types";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingFade } from "@/components/ui/LoadingFade";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/devices/$id")({
  component: AdminDeviceDetailPage,
});

function AdminDeviceDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [replaceCode, setReplaceCode] = useState("");

  const { data: device, isLoading } = useQuery({
    queryKey: ["device", id],
    queryFn: () => api.getDevice(id),
  });

  const { data: orgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => api.listOrganizations(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["device", id] });
    qc.invalidateQueries({ queryKey: ["devices"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<{ locked: boolean; features: FeatureEntitlements }>) => api.updateDevice(id, patch),
    onSuccess: () => {
      invalidate();
      toast.success("Device updated (mock — offline booths may not receive changes immediately)");
    },
  });

  const replaceMutation = useMutation({
    mutationFn: () => api.replaceDevice(id, { newCode: replaceCode }),
    onSuccess: (d) => {
      invalidate();
      toast.success("Device replaced");
      navigate({ to: "/admin/devices/$id", params: { id: d.id } });
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Replace failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteDevice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device revoked");
      navigate({ to: "/admin/devices" });
    },
  });

  const orgName = orgs?.find((o) => o.id === device?.organizationId)?.name;

  return (
    <DashboardLayout variant="admin" nav={adminNav} title={device?.name ?? "Device"} breadcrumb="Device detail">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/admin/devices">← Devices</Link>
      </Button>

      <LoadingFade loading={isLoading && !device}>
        {device && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass rounded-2xl p-5">
            <div className="flex flex-wrap gap-2">
              <ConnectivityBadge status={deviceConnectivity(device.lastOnlineAt)} />
              <LockBadge locked={device.locked} />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Device ID" value={device.id} />
              <Row label="Organization" value={orgName ?? device.organizationId} />
              <Row label="License" value={device.licenseStatus} />
              <Row label="Last online" value={format(parseISO(device.lastOnlineAt), "d MMM yyyy HH:mm")} />
              <Row label="AI photos" value={String(device.aiPhotosGenerated)} />
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Subscription lock prevents new guest sessions but allows event prep. Feature entitlements control what
              operators may enable in Session Modes — booth app and backend must enforce both.
            </p>
          </section>

          <section className="glass space-y-4 rounded-2xl p-5">
            <h2 className="text-sm font-semibold">Controls</h2>
            <ToggleRow
              label="Subscription lock"
              description="Lock device (mock enforcement)"
              checked={device.locked}
              onCheckedChange={(locked) => updateMutation.mutate({ locked })}
            />
            <FeatureToggle
              label="Allow Photo"
              checked={device.features.photo}
              onCheckedChange={(photo) => updateMutation.mutate({ features: { ...device.features, photo } })}
            />
            <FeatureToggle
              label="Allow Video"
              checked={device.features.video}
              onCheckedChange={(video) => updateMutation.mutate({ features: { ...device.features, video } })}
            />
            <FeatureToggle
              label="Allow Lenticular"
              checked={device.features.lenticular}
              onCheckedChange={(lenticular) => updateMutation.mutate({ features: { ...device.features, lenticular } })}
            />
            <FeatureToggle
              label="Allow AI Photobooth"
              checked={device.features.aiPhotobooth}
              onCheckedChange={(aiPhotobooth) =>
                updateMutation.mutate({ features: { ...device.features, aiPhotobooth } })
              }
            />
          </section>

          <section className="glass rounded-2xl p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {device.recentActivity.map((a, i) => (
                <li key={i} className="flex justify-between border-b border-border/50 pb-2">
                  <span>{a.message}</span>
                  <span className="text-xs text-muted-foreground">{format(parseISO(a.at), "d MMM HH:mm")}</span>
                </li>
              ))}
              {!device.recentActivity.length && <p className="text-muted-foreground">No activity logged.</p>}
            </ul>
          </section>

          <section className="glass rounded-2xl p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold">Replace device</h2>
            <p className="mt-1 text-xs text-muted-foreground">Requires a valid six-digit pairing code and revokes this device.</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="New 6-digit code"
                maxLength={6}
                value={replaceCode}
                onChange={(e) => setReplaceCode(e.target.value.replace(/\D/g, ""))}
                className="max-w-xs bg-background/60"
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" disabled={replaceCode.length !== 6}>
                    Replace device
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-border bg-deep">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Replace this device?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The current device will be revoked and entitlements transferred to the new pairing (mock workflow).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => replaceMutation.mutate()}>Confirm replace</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete / revoke device</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-border bg-deep">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke device license?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the device from active licensing. The organization and other devices are not affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate()}>Revoke</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        </div>
        )}
      </LoadingFade>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 px-3 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function FeatureToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return <ToggleRow label={label} checked={checked} onCheckedChange={onCheckedChange} />;
}
