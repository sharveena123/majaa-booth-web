import { Link } from "@tanstack/react-router";
import { CalendarPlus, MonitorSmartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardEmptyState({ userName }: { userName?: string }) {
  return (
    <div className="flex min-h-[min(520px,calc(100vh-12rem))] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-background/30 px-6 py-16 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary-glow">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        {userName ? `Welcome, ${userName.split(" ")[0]}` : "Welcome to Majaa"}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Your workspace is ready. Create your first event booking to track clients, deposits, and revenue — then link
        booths when hardware is installed.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="glow-btn">
          <Link to="/dashboard/orders" search={{ create: true }}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create your first order
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/machines">
            <MonitorSmartphone className="mr-2 h-4 w-4" />
            View machines
          </Link>
        </Button>
      </div>
    </div>
  );
}
