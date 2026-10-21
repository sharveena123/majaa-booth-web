import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Order, OrderStatus } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRM, outstandingBalance } from "@/lib/currency";

const statuses: OrderStatus[] = ["inquiry", "quoted", "confirmed", "completed", "cancelled"];

const schema = z.object({
  clientName: z.string().min(1, "Required"),
  eventName: z.string().min(1, "Required"),
  eventType: z.string().min(1, "Required"),
  eventDate: z.string().min(1, "Required"),
  packageName: z.string().min(1, "Required"),
  addOns: z.string(),
  totalPrice: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0),
  status: z.enum(["inquiry", "quoted", "confirmed", "completed", "cancelled"]),
  notes: z.string(),
});

export type OrderFormValues = z.infer<typeof schema>;

export function orderToFormValues(order: Order): OrderFormValues {
  return {
    clientName: order.clientName,
    eventName: order.eventName,
    eventType: order.eventType,
    eventDate: order.eventDate.slice(0, 10),
    packageName: order.packageName,
    addOns: order.addOns.join(", "),
    totalPrice: order.totalPrice,
    deposit: order.deposit,
    status: order.status,
    notes: order.notes,
  };
}

export function formValuesToInput(values: OrderFormValues) {
  return {
    ...values,
    eventDate: new Date(values.eventDate).toISOString(),
    addOns: values.addOns
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function OrderForm({
  defaultValues,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  defaultValues: OrderFormValues;
  onSubmit: (values: OrderFormValues) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const total = form.watch("totalPrice") || 0;
  const deposit = form.watch("deposit") || 0;

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client name" error={form.formState.errors.clientName?.message}>
          <Input className="bg-background/60" {...form.register("clientName")} />
        </Field>
        <Field label="Event name" error={form.formState.errors.eventName?.message}>
          <Input className="bg-background/60" {...form.register("eventName")} />
        </Field>
        <Field label="Event type" error={form.formState.errors.eventType?.message}>
          <Input className="bg-background/60" placeholder="Wedding, Corporate…" {...form.register("eventType")} />
        </Field>
        <Field label="Event date" error={form.formState.errors.eventDate?.message}>
          <Input className="bg-background/60" type="date" {...form.register("eventDate")} />
        </Field>
        <Field label="Package" error={form.formState.errors.packageName?.message}>
          <Input className="bg-background/60" {...form.register("packageName")} />
        </Field>
        <Field label="Add-ons (comma-separated)" error={form.formState.errors.addOns?.message}>
          <Input className="bg-background/60" {...form.register("addOns")} />
        </Field>
        <Field label="Total price (RM)" error={form.formState.errors.totalPrice?.message}>
          <Input className="bg-background/60" type="number" step="0.01" {...form.register("totalPrice")} />
        </Field>
        <Field label="Deposit (RM)" error={form.formState.errors.deposit?.message}>
          <Input className="bg-background/60" type="number" step="0.01" {...form.register("deposit")} />
        </Field>
      </div>

      <div className="rounded-xl border border-border bg-primary/5 px-4 py-3 text-sm">
        Outstanding balance: <span className="font-semibold text-primary-glow">{formatRM(outstandingBalance(total, deposit))}</span>
      </div>

      <Field label="Status" error={form.formState.errors.status?.message}>
        <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as OrderStatus)}>
          <SelectTrigger className="bg-background/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Notes" error={form.formState.errors.notes?.message}>
        <Textarea className="min-h-24 bg-background/60" {...form.register("notes")} />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
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
