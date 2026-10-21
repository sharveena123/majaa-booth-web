import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/dashboard-nav";
import { api, isMockApi } from "@/lib/api/client";
import { MOCK_PAIRING_CODES } from "@/lib/api/mock-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const schema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter exactly six digits"),
  organizationId: z.string().min(1, "Select an organization"),
  label: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/devices/link")({
  component: LinkDevicePage,
});

function LinkDevicePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: orgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => api.listOrganizations(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", organizationId: "", label: "" },
  });

  const claimMutation = useMutation({
    mutationFn: (values: FormValues) => api.claimDevice(values),
    onSuccess: (device) => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
      toast.success(`Device linked: ${device.name}`);
      navigate({ to: "/admin/devices/$id", params: { id: device.id } });
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Could not link device"),
  });

  return (
    <DashboardLayout variant="admin" nav={adminNav} title="Link device" breadcrumb="Pair booth with organization">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/admin/devices">← Devices</Link>
      </Button>

      <div className="glass max-w-lg rounded-2xl p-5">
        <p className="text-sm text-muted-foreground">
          Enter the six-digit code shown on the booth after installation.
          {isMockApi && (
            <>
              {" "}
              Demo codes: {Object.keys(MOCK_PAIRING_CODES).join(", ")}.
            </>
          )}
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await claimMutation.mutateAsync(values);
          })}
        >
          <Field label="Pairing code" error={form.formState.errors.code?.message}>
            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="bg-background/60 tracking-widest"
              {...form.register("code")}
            />
          </Field>
          <Field label="Organization" error={form.formState.errors.organizationId?.message}>
            <Select value={form.watch("organizationId")} onValueChange={(v) => form.setValue("organizationId", v)}>
              <SelectTrigger className="bg-background/60">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {(orgs ?? []).map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Device label (optional)" error={form.formState.errors.label?.message}>
            <Input className="bg-background/60" placeholder="Booth C · Mid Valley" {...form.register("label")} />
          </Field>
          <Button type="submit" className="w-full" disabled={claimMutation.isPending}>
            Claim device
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
