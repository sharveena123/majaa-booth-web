import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { Check, ChevronDown, MonitorPlay, LayoutDashboard, QrCode, Plug, SlidersHorizontal, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { faqs, features, pricing } from "@/data/marketing";
import { EASE, fadeUp, SectionHeading, SectionReveal, stagger, Logo } from "./primitives";
import { scrollToId } from "./Navbar";

/* ---------- Features ---------- */
export function FeatureSection() {
  return (
    <section id="features" className="relative scroll-mt-24 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Features" title={<>Everything Your <span className="glow-text">Booth</span> Needs.</>}
          sub="One platform to run unforgettable photo booth experiences and manage the business behind them." />
        <motion.div variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: I, title, desc }) => (
            <motion.article key={title} variants={fadeUp}
              className="glass group relative overflow-hidden p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-primary-glow/40 hover:shadow-glow-lg">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl opacity-60 transition-opacity group-hover:opacity-100" />
              <motion.div variants={{ hidden: { scale: 0.6, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: EASE, delay: 0.15 } } }}
                className="relative grid h-11 w-11 place-items-center rounded-xl border border-border bg-primary/15">
                <I className="h-5 w-5 text-primary-glow" />
              </motion.div>
              <h3 className="relative mt-5 font-semibold">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Showcase ---------- */
const stages = [
  { icon: MonitorPlay, title: "Run the Booth", desc: "The desktop app controls capture, layouts, camera, and printing.", rows: ["Camera · Canon R50 connected", "Layout · 2×6 strip", "Printer · DNP DS620 ready"] },
  { icon: LayoutDashboard, title: "Manage Your Business", desc: "The web platform organizes machines, bookings, and revenue.", rows: ["8 machines online", "12 upcoming events", "RM12,480 this month"] },
  { icon: QrCode, title: "Deliver the Memories", desc: "Guests scan QR codes and access their event galleries.", rows: ["Scan to download", "248 photos uploaded", "No account needed"] },
];

export function ProductShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const dot = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <section id="showcase" className="relative scroll-mt-24 overflow-hidden py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="The platform" title={<>One Platform. <span className="glow-text">Every Part</span> of the Experience.</>} />
        <div ref={ref} className="relative mt-20">
          {/* connector desktop */}
          <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-border lg:block">
            <motion.div style={{ scaleX: line }} className="h-full origin-left bg-gradient-primary" />
            <motion.div style={{ left: dot }} className="absolute -top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-highlight shadow-glow" />
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {stages.map(({ icon: I, title, desc, rows }, i) => (
              <SectionReveal key={title} delay={i * 0.18} className="relative">
                <div className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                  <I className="h-6 w-6" />
                </div>
                <div className="glass mt-8 p-6 text-center">
                  <p className="label">Stage 0{i + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                  <div className="mt-6 space-y-2 text-left">
                    {rows.map((r) => (
                      <div key={r} className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-glow" /> {r}
                      </div>
                    ))}
                  </div>
                  {i === 2 && (
                    <div className="mx-auto mt-5 grid h-24 w-24 grid-cols-5 gap-1 rounded-xl bg-foreground p-2">
                      {Array.from({ length: 25 }).map((_, k) => (
                        <span key={k} className={`rounded-[2px] ${[0,1,3,4,5,9,12,15,19,20,21,23,24,7,17].includes(k) ? "bg-deep" : ""}`} />
                      ))}
                    </div>
                  )}
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
const steps = [
  { icon: Plug, title: "Connect Your Booth", desc: "Install Majaa, plug in your camera and printer, and activate your license." },
  { icon: SlidersHorizontal, title: "Configure Your Experience", desc: "Pick modes, design layouts, and set AI styles for each event." },
  { icon: Camera, title: "Capture and Share", desc: "Guests snap, print, and scan to take their memories home." },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  return (
    <section id="how-it-works" className="scroll-mt-24 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="How it works" title={<>From Setup to <span className="glow-text">Showtime.</span></>} />
        <div ref={ref} className="relative mt-20 grid gap-12 md:grid-cols-3 md:gap-8">
          <div className="absolute left-7 top-0 h-full w-px bg-border md:left-[16%] md:right-[16%] md:top-7 md:h-px md:w-auto">
            <motion.div initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}} transition={{ duration: 1.6, ease: EASE }}
              className="h-full w-full origin-top bg-gradient-primary md:origin-left" />
          </div>
          {steps.map(({ icon: I, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.4, duration: 0.7, ease: EASE }}
              className="relative flex gap-6 md:flex-col md:items-center md:text-center">
              <motion.div initial={{ boxShadow: "0 0 0 0 transparent" }} animate={inView ? { boxShadow: ["0 0 0 0 transparent", "var(--shadow-glow-lg)", "var(--shadow-glow)"] } : {}}
                transition={{ delay: 0.3 + i * 0.4, duration: 1.2 }}
                className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary-glow/40 bg-deep">
                <I className="h-6 w-6 text-primary-glow" />
              </motion.div>
              <div>
                <p className="label md:mt-6">Step {i + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Pricing" title={<>A Plan That Fits Your <span className="glow-text">Booth Business.</span></>}
          sub="Illustrative plans — final pricing coming soon." />
        <motion.div variants={stagger(0.12)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 md:grid-cols-3">
          {pricing.map((p) => (
            <motion.div key={p.name} variants={fadeUp}
              className={`glass relative flex flex-col p-8 transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-primary-glow/40 ${p.highlighted ? "border-primary-glow/50 bg-primary/10 shadow-glow-lg" : ""}`}>
              {p.highlighted && <span className="absolute -top-3 left-8 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold">Most popular</span>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <p className="mt-6 text-4xl font-bold">{p.price}<span className="text-base font-normal text-muted-foreground">{p.period}</span></p>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 text-primary-glow" />{f}</li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-8 ${p.highlighted ? "glow-btn" : "ghost-btn"}`}>Get Started</Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-24 py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading eyebrow="FAQ" title={<>Got <span className="glow-text">Questions?</span></>} />
        <SectionReveal className="mt-14 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`glass !rounded-2xl transition-colors ${isOpen ? "border-primary-glow/40" : ""}`}>
                <h3>
                  <button id={`faq-b-${i}`} aria-expanded={isOpen} aria-controls={`faq-p-${i}`} onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium">
                    {f.q}
                    <ChevronDown className={`h-5 w-5 shrink-0 text-primary-glow transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`}
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                      <p className="px-6 pb-5 text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </SectionReveal>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1.1, 0.9]);
  const op = useTransform(scrollYProgress, [0, 0.5], [0.3, 1]);
  return (
    <section ref={ref} className="relative overflow-hidden py-36">
      <motion.div style={{ scale, opacity: op }} className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-[150px]" />
      <SectionReveal className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">Ready to <span className="glow-text">Elevate</span> Your Photo Booth Business?</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">Bring your booth, bookings, and guest experiences together with Majaa.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/signup" className="glow-btn">Get Started</Link>
          <button onClick={() => scrollToId("features")} className="ghost-btn">Explore Features</button>
        </div>
      </SectionReveal>
    </section>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">Premium photo booth software and business platform for modern booth professionals.</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="label">Product</p>
          <button onClick={() => scrollToId("features")} className="block text-muted-foreground hover:text-foreground">Features</button>
          <button onClick={() => scrollToId("pricing")} className="block text-muted-foreground hover:text-foreground">Pricing</button>
          <Link to="/login" className="block text-muted-foreground hover:text-foreground">Sign In</Link>
          <Link to="/signup" className="block text-muted-foreground hover:text-foreground">Get Started</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="label">Legal</p>
          <Link to="/privacy" className="block text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="block text-muted-foreground hover:text-foreground">Terms of Service</Link>
        </div>
      </div>
      <p className="border-t border-border py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Majaa. All rights reserved.</p>
    </footer>
  );
}
