import { motion } from "framer-motion";
import {
  LayoutDashboard, MonitorSmartphone, ShoppingBag, Wallet, Settings, Search, Bell,
  Monitor, CalendarDays, Sparkles, Lock,
} from "lucide-react";
import { EASE } from "./primitives";

const nav = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: MonitorSmartphone, label: "Machines" },
  { icon: ShoppingBag, label: "Orders" },
  { icon: Wallet, label: "Revenue" },
  { icon: Settings, label: "Settings" },
];

const stats = [
  { icon: Monitor, label: "Active Machines", value: "8", delta: "+2 this month" },
  { icon: CalendarDays, label: "Upcoming Events", value: "12", delta: "Next: Sat" },
  { icon: Wallet, label: "Bookings Revenue", value: "RM12,480", delta: "+18.4%" },
  { icon: Sparkles, label: "AI Photos", value: "1,284", delta: "+342 wk" },
];

const machines = [
  { name: "Booth A · KL", on: true },
  { name: "Booth B · PJ", on: true },
  { name: "Mirror 01", on: true },
  { name: "360 Spin", on: false },
];

const orders = [
  { name: "Aisyah & Daniel Wedding", type: "Wedding", amt: "RM2,400", st: "Confirmed" },
  { name: "Petronas Annual Dinner", type: "Corporate", amt: "RM3,850", st: "Deposit" },
  { name: "Lim & Mei Ling Wedding", type: "Wedding", amt: "RM1,980", st: "Confirmed" },
];

const PATH = "M0,92 C30,84 50,60 80,64 C110,68 130,40 160,46 C190,52 210,78 240,70 C270,62 290,28 320,30 C350,32 370,52 400,38 C420,30 440,14 460,10";

export function DashboardPreview() {
  return (
    <div className="glass overflow-hidden !rounded-2xl bg-deep/80 text-[11px]">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary-glow/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-highlight/40" />
        <span className="ml-3 text-muted-foreground">Majaa — Business</span>
      </div>
      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-40 shrink-0 border-r border-border bg-background/40 p-3 sm:block">
          <div className="mb-4 flex items-center gap-2 px-2 font-bold">
            <span className="h-5 w-5 rounded-md bg-gradient-primary" /> Majaa
          </div>
          {nav.map(({ icon: I, label, active }) => (
            <div key={label} className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-2 ${active ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}>
              <I className={`h-3.5 w-3.5 ${active ? "text-primary-glow" : ""}`} /> {label}
            </div>
          ))}
          <div className="mt-6 rounded-xl border border-border bg-primary/10 p-3">
            <p className="font-semibold">Professional</p>
            <p className="mt-1 text-muted-foreground">3 / 3 licenses</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-4">
          {/* top bar */}
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5 text-muted-foreground">
              <Search className="h-3.5 w-3.5" /> Search machines, orders…
            </div>
            <div className="relative grid h-7 w-7 place-items-center rounded-full border border-border">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-highlight animate-pulse-dot" />
            </div>
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary font-bold">S</div>
          </div>

          <p className="mt-4 text-sm font-semibold">Welcome back, Sharveena</p>
          <p className="text-muted-foreground">Here's your booth business today.</p>

          {/* stats */}
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {stats.map(({ icon: I, label, value, delta }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.08, duration: 0.6, ease: EASE }}
                className="rounded-xl border border-border bg-background/50 p-2.5"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground"><I className="h-3 w-3 text-primary-glow" />{label}</div>
                <p className="mt-1.5 text-base font-bold">{value}</p>
                <p className="text-primary-glow">{delta}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-2 grid gap-2 lg:grid-cols-3">
            {/* chart */}
            <div className="rounded-xl border border-border bg-background/50 p-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Revenue · last 30 days</p>
                  <p className="text-sm font-bold">RM12,480 <span className="text-[10px] font-medium text-primary-glow">↑ 18.4%</span></p>
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 text-primary-glow">Monthly</span>
              </div>
              <svg viewBox="0 0 460 110" className="mt-2 h-24 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="dpLine" x1="0" x2="1">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--highlight)" />
                  </linearGradient>
                </defs>
                {[25, 55, 85].map((y) => <line key={y} x1="0" x2="460" y1={y} y2={y} stroke="var(--border)" />)}
                <motion.path d={`${PATH} L460,110 L0,110 Z`} fill="url(#dpFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} />
                <motion.path d={PATH} fill="none" stroke="url(#dpLine)" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 1.8, ease: EASE }} />
                <motion.circle cx="320" cy="30" r="4" fill="var(--highlight)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.6 }} />
              </svg>
            </div>
            {/* machines */}
            <div className="rounded-xl border border-border bg-background/50 p-3">
              <p className="mb-2 text-muted-foreground">Machine status</p>
              {machines.map((m) => (
                <div key={m.name} className="flex items-center justify-between py-1.5">
                  <span>{m.name}</span>
                  {m.on ? (
                    <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-primary-glow">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-pulse-dot" /> Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground"><Lock className="h-2.5 w-2.5" /> Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* orders */}
          <div className="mt-2 rounded-xl border border-border bg-background/50 p-3">
            <p className="mb-1 text-muted-foreground">Recent orders</p>
            {orders.map((o) => (
              <div key={o.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-border py-1.5 first:border-0 sm:grid-cols-[1fr_80px_70px_auto]">
                <span className="truncate">{o.name}</span>
                <span className="hidden text-muted-foreground sm:block">{o.type}</span>
                <span className="font-semibold">{o.amt}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-primary-glow">{o.st}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
