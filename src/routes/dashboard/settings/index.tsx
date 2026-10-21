import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Sparkles, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { subscriberNav } from "@/components/dashboard/dashboard-nav";
import { useAuth } from "@/contexts/auth-context";
import { useOrganizationId } from "@/hooks/use-org-id";
import { api } from "@/lib/api/client";
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
import { resetOnboarding } from "@/hooks/use-onboarding";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const orgId = useOrganizationId();

  const { data: org } = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => api.getOrganization(orgId),
    enabled: !!orgId,
  });

  const exportMutation = useMutation({
    mutationFn: () => api.exportSubscriberData(orgId),
    onSuccess: (bundle) => {
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `majaa-export-${orgId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    },
  });

  return (
    <DashboardLayout variant="subscriber" nav={subscriberNav} title="Settings" breadcrumb="Account & organization">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">User profile</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Name" value={user?.name ?? "—"} />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Role" value={user?.role ?? "—"} />
            {user?.isGuest && <Row label="Session" value="Guest (mock)" />}
          </dl>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Organization</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Name" value={org?.name ?? "—"} />
            <Row label="Contact" value={org?.contactEmail ?? "—"} />
            <Row label="Plan" value={org?.plan ?? "—"} />
            <Row label="Machine allowance" value={org ? String(org.machineAllowance) : "—"} />
            <Row label="Status" value={org?.subscriptionStatus ?? "—"} />
          </dl>
        </section>

        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Data & account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Export includes organization profile, authorized devices, orders, and cloud configuration status (never secrets).
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {user?.authProvider === "firebase" && (
              <Button
                variant="outline"
                onClick={() => {
                  resetOnboarding(user.id);
                  toast.message("Product tour will open on the overview.");
                  navigate({ to: "/dashboard" });
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Replay product tour
              </Button>
            )}
            <Button variant="secondary" onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border bg-deep">
                <AlertDialogHeader>
                  <AlertDialogTitle>Request account deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    This mock UI cannot perform legally compliant deletion. In production, a secure backend workflow must
                    verify identity, revoke devices, and purge tenant data. Confirming here only signs you out locally.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      toast.message("Signed out — contact support for account deletion.");
                      void logout();
                    }}
                  >
                    I understand — sign out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
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
