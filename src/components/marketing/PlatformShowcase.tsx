import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check, Cloud, LayoutDashboard, MonitorPlay, QrCode, Camera, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { fadeUp, SectionHeading, stagger } from "./primitives";

type Kind = "booth" | "dashboard" | "phone";

type Pillar = {
  kind: Kind;
  who: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  points: string[];
  screenshotAlt: string;
  screenshotSrc?: string;
};

const pillars: Pillar[] = [
  {
    kind: "booth",
    who: "You, at the event",
    icon: MonitorPlay,
    title: "Run the booth",
    desc: "One app on your PC handles the guest screen, camera and printer.",
    points: ["Photo, AI & lenticular modes", "Works offline, syncs when back online", "Built for touchscreens"],
    screenshotAlt: "Majaa Booth app",
  },
  {
    kind: "dashboard",
    who: "You & your team",
    icon: LayoutDashboard,
    title: "Manage online",
    desc: "Log in from any browser to see machines, bookings and revenue.",
    points: ["Turn features on per booth", "Track events and orders", "Your whole fleet in one place"],
    screenshotAlt: "Majaa dashboard",
  },
  {
    kind: "phone",
    who: "Your guests",
    icon: QrCode,
    title: "Get their photos",
    desc: "Guests scan a QR code. No app, no account.",
    points: ["QR on prints or the booth screen", "Photos appear as they upload", "Download straight to their phone"],
    screenshotAlt: "Guest gallery on phone",
  },
];

const links: { icon: LucideIcon; label: string }[] = [
  { icon: Cloud, label: "Photos upload automatically" },
  { icon: QrCode, label: "Guests scan to download" },
];

/**
 * One looping timeline, in milliseconds per phase:
 * 0 card 1 pops → 1 neon flows to card 2 → 2 card 2 pops → 3 neon flows to card 3 → 4 card 3 pops → 5 everything glows, then restart.
 */
const PHASE_MS = [1000, 1100, 1000, 1100, 1000, 2200];
const HOLD = PHASE_MS.length - 1;

const POP = { type: "spring", stiffness: 240, damping: 16, mass: 0.8 } as const;
const SOFT = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;

export function HowItWorks() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [phase, setPhase] = useState(0);

  // Only run the loop while the section is on screen; it restarts from step 1 each time.
  useEffect(() => {
    if (reduce || !inView) return;
    let t: number;
    const tick = (p: number) => {
      setPhase(p);
      t = window.setTimeout(() => tick((p + 1) % PHASE_MS.length), PHASE_MS[p]);
    };
    tick(0);
    return () => window.clearTimeout(t);
  }, [reduce, inView]);

  const p = reduce ? HOLD : phase;

  return (
    <section className="relative overflow-hidden py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-24 h-[520px] bg-gradient-to-b from-primary/12 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <div className="relative mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div id="how-it-works">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                Snap at the event. <span className="glow-text">Share in seconds.</span>
              </>
            }
            sub="Three simple parts that work together, so you run the booth and your guests get their photos."
          />
        </div>

        <motion.div
          ref={ref}
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid items-stretch gap-0 lg:mt-16 lg:grid-cols-[1fr_5.5rem_1fr_5.5rem_1fr]"
        >
          {pillars.map((pillar, i) => (
            <Fragment key={pillar.title}>
              <motion.div variants={fadeUp} className="flex">
                <PillarCard
                  pillar={pillar}
                  step={i + 1}
                  active={p === i * 2}
                  lit={p >= i * 2}
                  reduce={!!reduce}
                />
              </motion.div>
              {i < links.length && (
                <FlowLink
                  {...links[i]}
                  flowing={p === i * 2 + 1}
                  lit={p >= i * 2 + 1}
                  ms={PHASE_MS[i * 2 + 1]}
                  reduce={!!reduce}
                />
              )}
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PillarCard({
  pillar: p,
  step,
  active,
  lit,
  reduce,
}: {
  pillar: Pillar;
  step: number;
  active: boolean;
  lit: boolean;
  reduce: boolean;
}) {
  const Icon = p.icon;
  return (
    <motion.div
      className="relative flex w-full rounded-3xl"
      // "Pop up": spring overshoot when the step becomes active, settles when lit, sinks back when the loop resets.
      animate={
        reduce
          ? undefined
          : {
              y: active ? -10 : lit ? 0 : 14,
              scale: active ? 1.03 : lit ? 1 : 0.95,
              opacity: lit ? 1 : 0.4,
              boxShadow: active
                ? "0 0 60px -6px oklch(0.72 0.18 306 / 65%)"
                : lit
                  ? "0 0 28px -10px oklch(0.72 0.18 306 / 40%)"
                  : "0 0 0px 0px oklch(0.72 0.18 306 / 0%)",
            }
      }
      transition={active ? POP : SOFT}
    >
      {/* Neon border: a bright comet circles the card while it's the active step */}
      <div className="relative flex w-full overflow-hidden rounded-3xl bg-white/10 p-px">
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
          <motion.div
            className="aspect-square w-[260%] shrink-0"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, transparent 220deg, #9333EA 280deg, #F0ABFC 330deg, #22D3EE 350deg, transparent 360deg)",
            }}
            animate={{ rotate: 360, opacity: active && !reduce ? 1 : 0 }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              opacity: { duration: 0.4 },
            }}
          />
        </div>

        <article className="relative flex w-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#100820]">
          {/* Visual stage */}
          <div className="relative grid place-items-center overflow-hidden bg-gradient-to-b from-[#9333EA]/20 via-[#1E0B38]/60 to-transparent px-6 pb-2 pt-10">
            <motion.span
              className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow"
              animate={reduce ? undefined : { scale: active ? [1, 1.35, 1] : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {step}
            </motion.span>
            <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-muted-foreground">
              {p.who}
            </span>
            <div className="h-52 w-full max-w-[19rem] sm:h-56">
              {p.screenshotSrc ? (
                <img
                  src={p.screenshotSrc}
                  alt={p.screenshotAlt}
                  loading="lazy"
                  className="h-full w-full rounded-t-xl border border-white/15 object-cover object-top shadow-2xl"
                />
              ) : (
                <Mock kind={p.kind} />
              )}
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </span>
              <h3 className="text-xl font-semibold sm:text-2xl">{p.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{p.desc}</p>

            <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5">
              {p.points.map((pt, i) => (
                <motion.li
                  key={pt}
                  className="flex items-start gap-2.5 text-sm text-foreground/90"
                  // bullets slide in one after another each time the card pops
                  animate={reduce ? undefined : { opacity: lit ? 1 : 0.5, x: lit ? 0 : -6 }}
                  transition={{ duration: 0.5, delay: active ? 0.15 + i * 0.12 : 0, ease: "easeOut" }}
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary-glow" strokeWidth={3} />
                  </span>
                  <span>{pt}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </motion.div>
  );
}

/** Neon connector: the light travels from one card to the next, then stays lit until the loop restarts. */
function FlowLink({
  icon: Icon,
  label,
  flowing,
  lit,
  ms,
  reduce,
}: {
  icon: LucideIcon;
  label: string;
  flowing: boolean;
  lit: boolean;
  ms: number;
  reduce: boolean;
}) {
  // Fill travels for the length of its phase; on reset it just fades out (no backwards wipe).
  const fill = (axis: "width" | "height") => ({
    animate: { [axis]: lit ? "100%" : "0%", opacity: lit ? 1 : 0 },
    transition: lit
      ? { [axis]: { duration: reduce ? 0 : (ms / 1000) * 0.9, ease: [0.45, 0, 0.25, 1] }, opacity: { duration: 0.2 } }
      : { [axis]: { duration: 0 }, opacity: { duration: 0.6 } },
    initial: false as const,
  });

  const glow = "bg-gradient-to-r from-[#9333EA] via-[#F0ABFC] to-[#22D3EE] shadow-[0_0_14px_2px_#C084FC]";
  const glowY = "bg-gradient-to-b from-[#9333EA] via-[#F0ABFC] to-[#22D3EE] shadow-[0_0_14px_2px_#C084FC]";

  return (
    <div className="relative flex h-24 items-center justify-center lg:h-auto" aria-hidden>
      {/* track */}
      <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-[#9333EA]/25 lg:inset-x-0 lg:inset-y-auto lg:top-1/2 lg:h-0.5 lg:w-auto lg:-translate-y-1/2 lg:translate-x-0">
        {/* vertical fill (mobile) */}
        <motion.div className={`absolute left-0 top-0 w-full rounded-full lg:hidden ${glowY}`} {...fill("height")}>
          <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_4px_#F0ABFC]" />
        </motion.div>
        {/* horizontal fill (desktop) */}
        <motion.div className={`absolute left-0 top-0 hidden h-full rounded-full lg:block ${glow}`} {...fill("width")}>
          <span className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_4px_#F0ABFC]" />
        </motion.div>
      </div>

      {/* chip lights up as the neon passes through */}
      <div className="relative flex flex-col items-center gap-1.5 rounded-2xl bg-[#0c0614] px-2 py-2">
        <motion.span
          className="grid h-10 w-10 place-items-center rounded-full border bg-primary/15"
          animate={{
            scale: flowing && !reduce ? [1, 1.18, 1] : 1,
            borderColor: lit ? "rgba(240,171,252,0.8)" : "rgba(192,132,252,0.25)",
            boxShadow: lit ? "0 0 22px -2px #C084FC" : "0 0 0px 0px #C084FC",
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Icon className={`h-5 w-5 transition-colors duration-500 ${lit ? "text-[#F5D0FE]" : "text-primary-glow/50"}`} />
        </motion.span>
        <span className="max-w-[5.5rem] text-center text-[11px] leading-tight text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

/** Drawn stand-ins so the section looks finished before real screenshots exist. */
function Mock({ kind }: { kind: Kind }) {
  if (kind === "booth") {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-t-xl border border-white/15 bg-[#0a0512] shadow-2xl">
        <div className="relative m-2 flex-1 rounded-lg bg-gradient-to-br from-[#4C1D95] via-[#9333EA]/60 to-[#F472B6]/60">
          <div className="absolute inset-3 rounded-md border-2 border-dashed border-white/40" />
          <Camera className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white/80" />
        </div>
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex gap-1.5">
            {["Photo", "AI", "3D"].map((m, i) => (
              <span
                key={m}
                className={`rounded-full px-2 py-0.5 text-[10px] ${i === 0 ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/60"}`}
              >
                {m}
              </span>
            ))}
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/80">
            <span className="h-5 w-5 rounded-full bg-white" />
          </span>
        </div>
      </div>
    );
  }

  if (kind === "dashboard") {
    const bars = [40, 62, 48, 80, 66, 92];
    return (
      <div className="flex h-full overflow-hidden rounded-t-xl border border-white/15 bg-[#0a0512] shadow-2xl">
        <div className="flex w-10 flex-col items-center gap-2 border-r border-white/10 bg-white/[0.03] py-3">
          {[0, 1, 2, 3].map((n) => (
            <span key={n} className={`h-4 w-4 rounded ${n === 0 ? "bg-primary" : "bg-white/15"}`} />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="grid grid-cols-3 gap-2">
            {["12", "248", "$3.4k"].map((v) => (
              <div key={v} className="rounded-md bg-white/[0.06] p-2">
                <div className="h-1 w-6 rounded bg-white/20" />
                <p className="mt-1.5 text-sm font-semibold text-white">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-1 items-end gap-1.5 rounded-md bg-white/[0.04] p-2">
            {bars.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className="flex-1 rounded-sm bg-gradient-to-t from-[#9333EA] to-[#F0ABFC]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tones = ["#9333EA", "#F472B6", "#6366F1", "#C084FC", "#22D3EE", "#F0ABFC"];
  return (
    <div className="mx-auto h-full w-32 overflow-hidden rounded-t-[1.5rem] border-[3px] border-white/20 bg-[#0a0512] p-2 shadow-2xl">
      <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {tones.map((c, i) => (
          <span key={i} className="aspect-square rounded-md opacity-80" style={{ background: `linear-gradient(135deg, ${c}, #1E0B38)` }} />
        ))}
      </div>
      <span className="mt-2 flex items-center justify-center gap-1 rounded-full bg-gradient-primary py-1.5 text-[10px] font-semibold text-primary-foreground">
        <Download className="h-3 w-3" /> Download
      </span>
    </div>
  );
}