import { createFileRoute, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/dashboard-nav";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const schema = z.object({
  accountOrEndpoint: z.string().min(3, "Required"),
  bucketName: z.string().min(1, "Required"),
  accessKeyId: z.string().min(1, "Required"),
  secretAccessKey: z.string().min(1, "Required"),
  publicGalleryDomain: z.string().min(3, "Required"),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/organizations/$id/cloud")({
  component: CloudConfigPage,
});

function CloudConfigPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: org } = useQuery({
    queryKey: ["organization", id],
    queryFn: () => api.getOrganization(id),
  });

  const { data: cloud, isLoading } = useQuery({
    queryKey: ["cloud", id],
    queryFn: () => api.getCloudConfig(id),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountOrEndpoint: "",
      bucketName: cloud?.bucketName ?? "",
      accessKeyId: "",
      secretAccessKey: "",
      publicGalleryDomain: cloud?.publicGalleryDomain ?? "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => api.saveCloudConfig(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cloud", id] });
      form.reset({
        accountOrEndpoint: "",
        bucketName: cloud?.bucketName ?? "",
        accessKeyId: "",
        secretAccessKey: "",
        publicGalleryDomain: form.getValues("publicGalleryDomain"),
      });
      toast.success("Cloud configuration saved (mock — secrets not stored)");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Save failed"),
  });

  return (
    <DashboardLayout
      variant="admin"
      nav={adminNav}
      title="Cloud configuration"
      breadcrumb={org?.name ?? id}
    >
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/admin/organizations/$id" params={{ id }}>← Organization</Link>
      </Button>

      <div className="glass max-w-2xl rounded-2xl p-5">
        <p className="text-sm text-muted-foreground">
          Configure R2 storage and public gallery domain. Secrets are never returned after save and are not persisted in
          mock mode or browser storage. Production requires encrypted backend storage.
        </p>

        {cloud?.configured && (
          <p className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary-glow">
            Configured ✓
            {cloud.bucketName && <span className="ml-2 font-normal text-muted-foreground">Bucket: {cloud.bucketName}</span>}
          </p>
        )}

        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await saveMutation.mutateAsync(values);
          })}
        >
          <FormField label="Account / endpoint" error={form.formState.errors.accountOrEndpoint?.message}>
            <Input className="bg-background/60" placeholder="https://…r2.cloudflarestorage.com" {...form.register("accountOrEndpoint")} />
          </FormField>
          <FormField label="Bucket name" error={form.formState.errors.bucketName?.message}>
            <Input className="bg-background/60" {...form.register("bucketName")} />
          </FormField>
          <FormField label="Access key ID" error={form.formState.errors.accessKeyId?.message}>
            <Input className="bg-background/60" type="password" autoComplete="off" {...form.register("accessKeyId")} />
          </FormField>
          <FormField label="Secret access key" error={form.formState.errors.secretAccessKey?.message}>
            <Input className="bg-background/60" type="password" autoComplete="off" {...form.register("secretAccessKey")} />
          </FormField>
          <FormField label="Public gallery domain" error={form.formState.errors.publicGalleryDomain?.message}>
            <Input className="bg-background/60" placeholder="gallery.example.com" {...form.register("publicGalleryDomain")} />
          </FormField>
          <Button type="submit" disabled={saveMutation.isPending || isLoading}>
            Save configuration
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
