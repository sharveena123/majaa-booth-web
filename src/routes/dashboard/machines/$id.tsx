import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ConnectivityBadge, LockBadge } from "@/components/dashboard/StatusBadge";
import { subscriberNav } from "@/components/dashboard/dashboard-nav";
import { useOrganizationId } from "@/hooks/use-org-id";
import { api } from "@/lib/api/client";
import { deviceConnectivity } from "@/lib/api/mock-store";
import { LoadingFade } from "@/components/ui/LoadingFade";

export const Route = createFileRoute("/dashboard/machines/$id")({
  component: MachineDetailPage,
});

function MachineDetailPage() {
  const { id } = Route.useParams();
  const orgId = useOrganizationId();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["machine", id, orgId],
    queryFn: async () => {
      const device = await api.getDevice(id);
      if (device.organizationId !== orgId) throw new Error("Not found");
      return device;
    },
    enabled: !!orgId,
  });

  const conn = data ? deviceConnectivity(data.lastOnlineAt) : "offline";

  return (
    <DashboardLayout
      variant="subscriber"
      nav={subscriberNav}
      title={data?.name ?? "Machine"}
      breadcrumb="Machines › Detail"
    >
      {isError && <p className="text-destructive">Machine not found or not authorized.</p>}
      <LoadingFade loading={isLoading && !data}>
        {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass rounded-2xl p-5">
            <div className="flex flex-wrap gap-2">
              <ConnectivityBadge status={conn} />
              <LockBadge locked={data.locked} />
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Device ID" value={data.id} />
              <Row label="License" value={data.licenseStatus} />
              <Row label="Last online" value={format(parseISO(data.lastOnlineAt), "d MMM yyyy, HH:mm")} />
              <Row label="AI photos generated" value={String(data.aiPhotosGenerated)} />
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Subscriber view is read-only. Cloud credentials and privileged secrets are never shown here.
            </p>
          </section>
          <section className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold">Allowed features</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <FeatureRow label="Photo" enabled={data.features.photo} />
              <FeatureRow label="Video" enabled={data.features.video} />
              <FeatureRow label="Lenticular" enabled={data.features.lenticular} />
              <FeatureRow label="AI Photobooth" enabled={data.features.aiPhotobooth} />
            </ul>
          </section>
        </div>
        )}
      </LoadingFade>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
      <span>{label}</span>
      <span className={enabled ? "text-primary-glow" : "text-muted-foreground"}>{enabled ? "Allowed" : "Not entitled"}</span>
    </li>
  );
}
