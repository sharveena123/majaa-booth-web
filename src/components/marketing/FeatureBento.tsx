import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { features } from "@/data/marketing";
import { EASE, fadeUp, SectionHeading, stagger } from "./primitives";

type BentoTier = "stat" | "double" | "column";
type BentoTone = "violet" | "plum" | "orchid" | "mauve" | "amethyst" | "fuchsia" | "midnight";

const cardConfig: Record<
  string,
  { placement: string; tier: BentoTier; tone: BentoTone; statBoost?: boolean }
> = {
  "Photo Booth": { placement: "lg:col-start-1 lg:row-start-1 lg:row-span-3", tier: "double", tone: "violet" },
  Lenticular: { placement: "lg:col-start-1 lg:row-start-4 lg:row-span-3", tier: "double", tone: "plum" },
  "Cloud QR": {
    placement: "lg:col-start-2 lg:row-start-1 lg:row-span-2",
    tier: "stat",
    tone: "orchid",
    statBoost: true,
  },
  "Print Integration": {
    placement: "lg:col-start-2 lg:row-start-3 lg:row-span-2",
    tier: "stat",
    tone: "mauve",
    statBoost: true,
  },
  "Layout Designer": { placement: "lg:col-start-2 lg:row-start-5 lg:row-span-2", tier: "double", tone: "amethyst" },
  "AI Photobooth": { placement: "lg:col-start-3 lg:row-start-1 lg:row-span-3", tier: "column", tone: "fuchsia" },
  "Device Management": { placement: "lg:col-start-3 lg:row-start-4 lg:row-span-3", tier: "column", tone: "midnight" },
};

const AI_STYLE_LOOK: { chip: string; portrait: string }[] = [
  { chip: "border-[#C084FC]/60 bg-[#9333EA]/35 text-[#F5D0FE]", portrait: "from-[#7C3AED] via-[#C084FC] to-[#F0ABFC]" },
  { chip: "border-[#22D3EE]/55 bg-[#0891B2]/30 text-[#A5F3FC]", portrait: "from-[#06B6D4] via-[#8B5CF6] to-[#F472B6]" },
  { chip: "border-[#86EFAC]/55 bg-[#16A34A]/25 text-[#DCFCE7]", portrait: "from-[#4ADE80] via-[#A855F7] to-[#F0ABFC]" },
  { chip: "border-[#FCD34D]/55 bg-[#D97706]/25 text-[#FEF3C7]", portrait: "from-[#F59E0B] via-[#9333EA] to-[#F472B6]" },
];

const PHOTO_COUNTDOWN = [
  "border-[#9333EA]/70 bg-[#9333EA]/25 text-[#E9D5FF]",
  "border-[#C084FC]/70 bg-[#C084FC]/20 text-[#F3E8FF]",
  "border-[#F0ABFC]/70 bg-[#F0ABFC]/15 text-[#FAE8FF]",
];

/** Card shell + nested preview surfaces — grouped by column for a calmer purple palette */
const bentoTone: Record<
  BentoTone,
  { shell: string; wash: string; icon: string; inset: string; hairline: string }
> = {
  violet: {
    shell: "border-[oklch(0.72_0.16_306/22%)] bg-[oklch(0.19_0.08_298)]",
    wash: "bg-[oklch(0.56_0.25_302/14%)]",
    icon: "border-[oklch(0.72_0.16_306/30%)] bg-[oklch(0.56_0.25_302/18%)]",
    inset: "border-white/10 bg-[oklch(0.11_0.035_300/65%)]",
    hairline: "via-[oklch(0.72_0.16_306/35%)]",
  },
  plum: {
    shell: "border-[oklch(0.84_0.12_322/18%)] bg-[oklch(0.17_0.075_302)]",
    wash: "bg-[oklch(0.84_0.13_322/10%)]",
    icon: "border-[oklch(0.84_0.12_322/28%)] bg-[oklch(0.21_0.09_298/70%)]",
    inset: "border-white/10 bg-[oklch(0.12_0.04_300/60%)]",
    hairline: "via-[oklch(0.84_0.13_322/30%)]",
  },
  orchid: {
    shell: "border-[oklch(0.72_0.16_306/20%)] bg-[oklch(0.2_0.07_308)]",
    wash: "bg-[oklch(0.72_0.18_306/12%)]",
    icon: "border-[oklch(0.72_0.16_306/25%)] bg-[oklch(0.56_0.25_302/15%)]",
    inset: "border-white/10 bg-[oklch(0.13_0.04_305/55%)]",
    hairline: "via-[oklch(0.72_0.18_306/28%)]",
  },
  mauve: {
    shell: "border-[oklch(0.56_0.25_302/18%)] bg-[oklch(0.18_0.065_296)]",
    wash: "bg-[oklch(0.56_0.25_302/10%)]",
    icon: "border-[oklch(0.56_0.25_302/22%)] bg-[oklch(0.22_0.08_298/50%)]",
    inset: "border-white/10 bg-[oklch(0.12_0.038_298/58%)]",
    hairline: "via-[oklch(0.56_0.25_302/25%)]",
  },
  amethyst: {
    shell: "border-[oklch(0.56_0.25_302/24%)] bg-[oklch(0.21_0.09_300)]",
    wash: "bg-[oklch(0.56_0.25_302/16%)]",
    icon: "border-primary/30 bg-primary/20",
    inset: "border-white/10 bg-[oklch(0.14_0.045_300/62%)]",
    hairline: "via-primary-glow/35",
  },
  fuchsia: {
    shell: "border-[oklch(0.72_0.18_306/28%)] bg-gradient-to-br from-[oklch(0.22_0.1_304)] via-[oklch(0.19_0.085_302)] to-[oklch(0.17_0.07_298)]",
    wash: "bg-[oklch(0.72_0.18_306/18%)]",
    icon: "border-primary-glow/35 bg-primary/25",
    inset: "border-white/12 bg-[oklch(0.11_0.04_300/70%)]",
    hairline: "via-primary-glow/45",
  },
  midnight: {
    shell: "border-[oklch(0.56_0.2_292/20%)] bg-[oklch(0.15_0.055_288)]",
    wash: "bg-[oklch(0.56_0.2_292/12%)]",
    icon: "border-[oklch(0.56_0.2_292/28%)] bg-[oklch(0.2_0.07_290/45%)]",
    inset: "border-white/10 bg-[oklch(0.11_0.03_290/68%)]",
    hairline: "via-[oklch(0.56_0.2_292/30%)]",
  },
};

export function FeatureBentoGrid() {
  return (
    <section className="relative py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-24 h-[560px] bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="relative mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div id="features">
          <SectionHeading
            eyebrow="Features"
            title={
              <>
                Everything Your <span className="glow-text">Booth</span> Needs.
              </>
            }
            sub="One canvas — booth app, AI, cloud, and dashboard previews looping live."
          />
        </div>

        <motion.div
          variants={stagger(0.04)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-border/60 bg-[oklch(0.13_0.045_300/75%)] p-3.5 shadow-[var(--shadow-glass)] backdrop-blur-xl sm:p-5 lg:mt-12 lg:p-4"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-highlight/[0.04]" />
          <div className="relative grid grid-cols-1 gap-2.5 lg:h-[860px] lg:grid-cols-3 lg:grid-rows-[repeat(6,minmax(0,1fr))] lg:gap-2.5">
            {features.map((f) => {
              const cfg = cardConfig[f.title];
              if (!cfg) return null;
              const { placement, tier, tone, statBoost } = cfg;
              const palette = bentoTone[tone];
              const isStat = tier === "stat";
              const isColumn = tier === "column";

              return (
                <motion.article
                  key={f.title}
                  variants={fadeUp}
                  className={`group relative flex flex-col rounded-2xl p-4 shadow-[inset_0_1px_0_oklch(1_0_0/6%)] sm:p-5 lg:h-full lg:min-h-0 ${palette.shell} ${placement} ${
                    isStat
                      ? statBoost
                        ? "min-h-[188px] lg:min-h-0"
                        : "min-h-[148px] lg:min-h-0"
                      : isColumn
                        ? "min-h-[320px] lg:min-h-0"
                        : "min-h-[240px] lg:min-h-0"
                  } ${isStat ? "overflow-visible lg:overflow-hidden" : "overflow-hidden"}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${palette.hairline}`}
                    aria-hidden
                  />
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${palette.wash}`}
                  />
                  <BentoHeader feature={f} tier={tier} iconClass={palette.icon} allowTitleWrap={isStat} />
                  <div
                    className={
                      isStat && statBoost
                        ? "relative mt-2.5 flex min-h-0 flex-1 flex-col"
                        : isStat
                          ? "relative mt-2.5 shrink-0"
                          : "relative mt-3 flex min-h-0 flex-1 flex-col overflow-hidden"
                    }
                  >
                    <FeaturePreview title={f.title} insetClass={palette.inset} statBoost={statBoost} />
                  </div>
                  <p
                    className={`relative mt-2.5 shrink-0 text-sm leading-relaxed text-muted-foreground/90 sm:text-[15px] ${
                      isColumn ? "text-center" : ""
                    } ${isStat ? "mt-2 text-xs sm:text-sm" : ""} ${statBoost ? "pb-0.5" : ""}`}
                  >
                    {f.desc}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BentoHeader({
  feature,
  tier,
  iconClass,
  allowTitleWrap = false,
}: {
  feature: (typeof features)[number];
  tier: BentoTier;
  iconClass: string;
  allowTitleWrap?: boolean;
}) {
  const I = feature.icon;
  const sm = tier === "stat";
  return (
    <div className={`relative flex shrink-0 gap-2.5 ${allowTitleWrap ? "items-start" : "items-center"}`}>
      <span
        className={`grid shrink-0 place-items-center border ${iconClass} ${sm ? "h-8 w-8 rounded-lg" : "h-9 w-9 rounded-xl"}`}
      >
        <I className={`text-primary-glow ${sm ? "h-4 w-4" : "h-[18px] w-[18px]"}`} />
      </span>
      <h3
        className={`min-w-0 text-base font-semibold leading-snug sm:text-lg ${allowTitleWrap ? "text-balance" : ""}`}
      >
        {feature.title}
      </h3>
    </div>
  );
}

function FeaturePreview({
  title,
  insetClass,
  statBoost,
}: {
  title: string;
  insetClass: string;
  statBoost?: boolean;
}) {
  switch (title) {
    case "Photo Booth":
      return <PhotoBoothPreview insetClass={insetClass} />;
    case "Lenticular":
      return <LenticularPreview insetClass={insetClass} />;
    case "AI Photobooth":
      return <AiPhotoboothPreview insetClass={insetClass} />;
    case "Layout Designer":
      return <LayoutDesignerPreview insetClass={insetClass} />;
    case "Cloud QR":
      return <CloudQrPreview insetClass={insetClass} tall={statBoost} />;
    case "Device Management":
      return <DeviceManagementPreview insetClass={insetClass} />;
    case "Print Integration":
      return <PrintPreview insetClass={insetClass} tall={statBoost} />;
    default:
      return null;
  }
}

function MiniApp({
  label,
  children,
  className = "",
  fill = true,
  insetClass = "border-white/10 bg-[oklch(0.11_0.035_300/65%)]",
}: {
  label: string;
  children: ReactNode;
  className?: string;
  fill?: boolean;
  insetClass?: string;
}) {
  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-[inset_0_1px_0_oklch(1_0_0/5%)] backdrop-blur-sm ${insetClass} ${fill ? "h-full" : ""} ${className}`}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-white/8 bg-black/15 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-primary/70" />
        <span className="h-2 w-2 rounded-full bg-primary-glow/50" />
        <span className="h-2 w-2 rounded-full bg-highlight/40" />
        <span className="ml-1 text-[11px] text-muted-foreground sm:text-xs">{label}</span>
      </div>
      <div className={`relative p-3 sm:p-3.5 ${fill ? "min-h-0 flex-1" : ""}`}>{children}</div>
    </div>
  );
}

function BoothGuestFigure({ className = "" }: { className?: string }) {
  const gradId = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 80 96"
      className={className}
      aria-hidden
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#F0ABFC" />
          <stop offset="45%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="22" r="14" fill={`url(#${gradId})`} opacity={0.95} />
      <path
        d="M14 92 C14 58 26 46 40 44 C54 46 66 58 66 92 Z"
        fill={`url(#${gradId})`}
        opacity={0.9}
      />
      <ellipse cx="40" cy="88" rx="28" ry="6" fill="#C084FC" opacity={0.2} />
    </svg>
  );
}

function PhotoBoothPreview({ insetClass }: { insetClass: string }) {
  const reduce = useReducedMotion();
  return (
    <MiniApp label="Majaa Booth · Live view" className="h-full" insetClass={insetClass}>
      <div className="relative h-full min-h-[100px] overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-br from-[#1E0B38] via-[#2E1065] to-[#120722] lg:min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.72_0.18_306/35%),transparent_55%)]" />
        <div className="absolute inset-3 rounded-lg border-2 border-dashed border-[#C084FC]/45" />
        <div className="pointer-events-none absolute inset-3 flex items-end justify-center pb-14">
          <motion.div
            className="relative"
            animate={reduce ? undefined : { y: [0, -3, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute -inset-4 rounded-full bg-[#9333EA]/25 blur-xl" />
            <BoothGuestFigure className="relative h-[4.5rem] w-[3.75rem] drop-shadow-[0_8px_20px_oklch(0.56_0.25_302/45%)] sm:h-20 sm:w-[4.25rem]" />
          </motion.div>
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#F0ABFC]/90 via-white/75 to-[#C084FC]/40"
          animate={reduce ? undefined : { opacity: [0, 0, 0.9, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.72, 0.78, 1] }}
        />
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {[1, 2, 3].map((n, i) => (
            <motion.span
              key={n}
              className={`grid h-9 w-9 place-items-center rounded-full border text-xs font-bold shadow-[0_0_14px_oklch(0.56_0.25_302/40%)] ${PHOTO_COUNTDOWN[i]}`}
              animate={reduce ? undefined : { scale: [1, 1, 1.15, 1], opacity: [0.35, 0.35, 1, 0.35] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.15, times: [0, 0.55, 0.72, 1] }}
            >
              {n}
            </motion.span>
          ))}
        </div>
        <motion.div
          className="absolute right-3 top-3 rounded-full border border-[#C084FC]/40 bg-[#9333EA]/30 px-2 py-0.5 text-[8px] text-[#F5D0FE]"
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Canon R50
        </motion.div>
      </div>
    </MiniApp>
  );
}

function LenticularPreview({ insetClass }: { insetClass: string }) {
  const reduce = useReducedMotion();
  const frames = [
    { label: "Smile", gradient: "from-[#9333EA] via-[#C084FC] to-[#F0ABFC]", text: "text-[#FAE8FF]" },
    { label: "Wave", gradient: "from-[#6366F1] via-[#A855F7] to-[#F472B6]", text: "text-[#FCE7F3]" },
  ];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % frames.length), 2200);
    return () => window.clearInterval(id);
  }, [reduce, frames.length]);

  return (
    <MiniApp label="Lenticular · Dual frame" className="h-full" insetClass={insetClass}>
      <div className="flex h-full min-h-[100px] flex-col items-center justify-center gap-2">
        <div className="relative h-32 w-[5rem] sm:h-36 sm:w-[5.5rem] [perspective:600px]">
          <motion.div
            className="relative h-full w-full"
            animate={reduce ? undefined : { rotateY: [0, 0, 42, 42, 0] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: EASE, times: [0, 0.35, 0.5, 0.85, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-[#C084FC]/35 bg-[#1E0B38] shadow-[0_0_24px_oklch(0.56_0.25_302/35%)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={frames[frame].label}
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={`absolute inset-0 bg-gradient-to-br ${frames[frame].gradient} flex items-center justify-center`}
                >
                  <span className={`text-sm font-semibold drop-shadow-sm ${frames[frame].text}`}>{frames[frame].label}</span>
                </motion.div>
              </AnimatePresence>
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#F0ABFC]/35 to-transparent"
                animate={reduce ? undefined : { x: ["-100%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
        <p className="text-[11px] text-muted-foreground sm:text-xs">Tilt flip · 2 frames looping</p>
      </div>
    </MiniApp>
  );
}

function AiPhotoboothPreview({ insetClass }: { insetClass: string }) {
  const styles = ["Studio", "Cyberpunk", "Garden", "Vintage"];
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % styles.length), 2400);
    return () => window.clearInterval(id);
  }, [reduce, styles.length]);

  return (
    <MiniApp label="AI · Guest screen" className="h-full w-full" insetClass={insetClass}>
      <div className="flex h-full min-h-[200px] flex-col items-center gap-2.5 lg:min-h-0 lg:gap-3">
        <div className="flex flex-wrap justify-center gap-2">
          {styles.map((s, i) => {
            const look = AI_STYLE_LOOK[i];
            return (
              <motion.span
                key={s}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap sm:text-xs ${
                  i === active ? look.chip : "border-white/10 bg-black/20 text-muted-foreground"
                }`}
                animate={
                  reduce || i !== active
                    ? undefined
                    : { scale: [1, 1.04, 1], boxShadow: ["0 0 0 transparent", "0 0 16px oklch(0.72 0.18 306 / 45%)", "0 0 0 transparent"] }
                }
                transition={{ duration: 2.4, repeat: Infinity }}
              >
                {s}
              </motion.span>
            );
          })}
        </div>
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[140px] flex-1 overflow-hidden rounded-xl border border-[#C084FC]/30 bg-[#120722] sm:max-w-[160px] lg:max-h-full lg:min-h-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#9333EA]/25 via-[#1E0B38] to-[#F472B6]/20" />
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0.4, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className={`absolute inset-x-3 top-10 bottom-14 overflow-hidden rounded-lg bg-gradient-to-br shadow-[inset_0_0_20px_oklch(1_0_0/15%)] ${AI_STYLE_LOOK[active].portrait}`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F0ABFC]/45 to-transparent"
              animate={reduce ? undefined : { y: ["-120%", "120%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          <motion.div
            className="absolute right-2 top-4 z-10 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-[11px] backdrop-blur-sm sm:text-xs"
            animate={reduce ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-muted-foreground">AI renders </span>
            <span className="bg-gradient-to-r from-[#C084FC] to-[#F472B6] bg-clip-text font-semibold text-transparent">+342</span>
          </motion.div>
          <div className="absolute bottom-3 left-0 right-0 px-3">
            <motion.p
              className="rounded-full border border-[#C084FC]/35 bg-[#9333EA]/25 py-2 text-center text-[11px] font-medium text-[#F5D0FE] backdrop-blur-sm sm:text-xs"
              animate={reduce ? undefined : { opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              Generating {styles[active]} portrait…
            </motion.p>
          </div>
        </div>
      </div>
    </MiniApp>
  );
}

function LayoutDesignerPreview({ insetClass }: { insetClass: string }) {
  const reduce = useReducedMotion();
  return (
    <MiniApp label="Layout · Strip designer" className="h-full" insetClass={insetClass}>
      <div className="flex h-full min-h-[100px] flex-col items-center justify-center gap-3 sm:flex-row">
        <div className="flex w-[72px] shrink-0 flex-col gap-1 rounded border border-[#C084FC]/25 bg-[#1E0B38]/80 p-1">
          {[
            "from-[#9333EA] to-[#C084FC]",
            "from-[#C084FC] to-[#F0ABFC]",
            "from-[#A855F7] to-[#F472B6]",
            "from-[#6366F1] to-[#9333EA]",
          ].map((grad, slot) => (
            <div key={slot} className="relative h-6 overflow-hidden rounded-sm bg-[#120722]">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${grad}`}
                animate={reduce ? undefined : { y: ["100%", "0%", "0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, delay: slot * 0.25, times: [0, 0.25, 0.75, 1] }}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex gap-2">
            {["#9333EA", "#C084FC", "#F0ABFC", "#1E0B38"].map((c) => (
              <span key={c} className="h-5 w-5 rounded-full border border-border" style={{ background: c }} />
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground">2×6 · safe zone</p>
        </div>
      </div>
    </MiniApp>
  );
}

function CloudQrPreview({ insetClass, tall }: { insetClass: string; tall?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 shadow-[inset_0_1px_0_oklch(1_0_0/5%)] ${tall ? "min-h-[5rem] flex-1 sm:min-h-[5.5rem] lg:min-h-0" : "h-[5rem] sm:h-[5.25rem]"} ${insetClass}`}
    >
      <div className="min-w-0">
        <motion.p
          className="bg-gradient-to-r from-[#C084FC] via-[#F0ABFC] to-[#9333EA] bg-clip-text text-2xl font-bold leading-none tracking-tight text-transparent"
          animate={reduce ? undefined : { opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          4.2K
        </motion.p>
        <p className="mt-1 text-[10px] leading-tight text-[#C084FC]/80 sm:text-xs">Gallery views</p>
      </div>
      <div className="relative grid h-11 w-11 shrink-0 grid-cols-4 gap-px rounded border border-[#9333EA]/40 bg-[#1E0B38] p-0.5 sm:h-12 sm:w-12">
        {Array.from({ length: 16 }).map((_, k) => (
          <span
            key={k}
            className={`rounded-[1px] ${k % 3 === 0 ? "bg-[#9333EA]" : k % 2 === 0 ? "bg-[#C084FC]" : "bg-[#F0ABFC]/90"}`}
          />
        ))}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#22D3EE]/70 via-[#C084FC]/50 to-transparent"
          animate={reduce ? undefined : { y: ["-100%", "100%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

function DeviceManagementPreview({ insetClass }: { insetClass: string }) {
  const reduce = useReducedMotion();
  const rows = [
    { name: "Booth A · KLCC", on: true, accent: "from-[#9333EA]/25 to-[#C084FC]/10" },
    { name: "Mirror 01 · Bangsar", on: true, accent: "from-[#6366F1]/25 to-[#A855F7]/10" },
    { name: "360 Spin · Gurney", on: false, accent: "from-[#78716C]/20 to-transparent" },
  ];
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setHighlight((h) => (h + 1) % rows.length), 2600);
    return () => window.clearInterval(id);
  }, [reduce, rows.length]);

  return (
    <MiniApp label="Dashboard · Machines" className="h-full" insetClass={insetClass}>
      <div className="flex h-full min-h-0 flex-col gap-2">
        <motion.p
          className="shrink-0 text-xs text-muted-foreground sm:text-sm"
          animate={reduce ? undefined : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Live machine status (mock heartbeat)
        </motion.p>
        <ul className="flex flex-1 flex-col justify-center gap-2">
          {rows.map((r, i) => {
            const active = i === highlight;
            return (
              <motion.li
                key={r.name}
                className={`flex items-center justify-between rounded-lg border bg-gradient-to-r px-3 py-2.5 text-sm ${
                  active
                    ? `border-[#C084FC]/50 ${r.accent} shadow-[0_0_20px_oklch(0.56_0.25_302/25%)]`
                    : "border-white/10 from-black/20 to-black/10"
                }`}
                animate={reduce ? undefined : active ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                <span className="font-medium">{r.name}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{r.on ? "Online" : "Stale"}</span>
                  <span className="relative flex h-3 w-3">
                    {r.on && !reduce && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary-glow/40"
                        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                      />
                    )}
                    <span
                      className={`relative h-3 w-3 rounded-full ${r.on ? "bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]" : "bg-[#F59E0B]/80"}`}
                    />
                  </span>
                </span>
              </motion.li>
            );
          })}
        </ul>
        <div className="mt-auto shrink-0 space-y-2 border-t border-white/8 pt-2">
          <div className="flex -space-x-2">
            {(
              [
                ["S", "from-[#9333EA] to-[#C084FC]"],
                ["A", "from-[#6366F1] to-[#F472B6]"],
                ["M", "from-[#22D3EE] to-[#A855F7]"],
              ] as const
            ).map(([l, grad], i) => (
              <motion.span
                key={l}
                className={`grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-gradient-to-br text-xs font-bold text-white ${grad}`}
                animate={reduce ? undefined : { y: [0, -4, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              >
                {l}
              </motion.span>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#4ADE80]/30 bg-gradient-to-r from-[#4ADE80]/10 to-[#9333EA]/15 px-3 py-2.5 text-sm">
            <span>Licensed machines</span>
            <motion.span
              className="font-semibold text-[#86EFAC]"
              animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              3 / 3 online
            </motion.span>
          </div>
        </div>
      </div>
    </MiniApp>
  );
}

function PrintPreview({ insetClass, tall }: { insetClass: string; tall?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 shadow-[inset_0_1px_0_oklch(1_0_0/5%)] ${tall ? "min-h-[5rem] flex-1 sm:min-h-[5.5rem] lg:min-h-0" : "h-[5rem] sm:h-[5.25rem]"} ${insetClass}`}
    >
      <div className="min-w-0">
        <p className="bg-gradient-to-r from-[#F0ABFC] to-[#9333EA] bg-clip-text text-2xl font-bold leading-none tracking-tight text-transparent">
          128
          <motion.span
            className="ml-1 bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] bg-clip-text text-xs font-semibold text-transparent"
            animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            +12%
          </motion.span>
        </p>
        <p className="mt-1 text-[10px] leading-tight text-muted-foreground sm:text-xs">Prints today</p>
      </div>
      <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-[#C084FC]/30 bg-gradient-to-b from-[#2E1065] to-[#120722] sm:h-12">
        <motion.div
          className="absolute left-1/2 top-0 h-8 w-9 -translate-x-1/2 rounded-b-sm border border-[#F0ABFC]/40 bg-gradient-to-b from-white via-[#F5D0FE] to-[#C084FC]"
          animate={reduce ? undefined : { y: ["-100%", "130%"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#9333EA] via-[#F472B6] to-[#22D3EE]"
          animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
