import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { Check, ChevronDown, Plug, SlidersHorizontal, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { faqs, pricing } from "@/data/marketing";
import { EASE, fadeUp, SectionHeading, SectionReveal, stagger, Logo } from "./primitives";
import { scrollToId } from "./Navbar";
import { FeatureBentoGrid } from "./FeatureBento";
/* ---------- Features ---------- */
export function FeatureSection() {
  return <FeatureBentoGrid />;
}

/* ---------- How it works ---------- */
export { HowItWorks } from "./PlatformShowcase";

// /* ---------- How it works ---------- */
// const steps = [
//   { icon: Plug, title: "Connect Your Booth", desc: "Install Majaa, plug in your camera and printer, and activate your license." },
//   { icon: SlidersHorizontal, title: "Configure Your Experience", desc: "Pick modes, design layouts, and set AI styles for each event." },
//   { icon: Camera, title: "Capture and Share", desc: "Guests snap, print, and scan to take their memories home." },
// ];

// export function HowItWorks() {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true, margin: "-120px" });
//   return (
//     <section id="how-it-works" className="scroll-mt-24 py-28">
//       <div className="mx-auto max-w-6xl px-6">
//         <SectionHeading eyebrow="How it works" title={<>From Setup to <span className="glow-text">Showtime.</span></>} />
//         <div ref={ref} className="relative mt-20 grid gap-12 md:grid-cols-3 md:gap-8">
//           <div className="absolute left-7 top-0 h-full w-px bg-border md:left-[16%] md:right-[16%] md:top-7 md:h-px md:w-auto">
//             <motion.div initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}} transition={{ duration: 1.6, ease: EASE }}
//               className="h-full w-full origin-top bg-gradient-primary md:origin-left" />
//           </div>
//           {steps.map(({ icon: I, title, desc }, i) => (
//             <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
//               transition={{ delay: 0.3 + i * 0.4, duration: 0.7, ease: EASE }}
//               className="relative flex gap-6 md:flex-col md:items-center md:text-center">
//               <motion.div initial={{ boxShadow: "0 0 0 0 transparent" }} animate={inView ? { boxShadow: ["0 0 0 0 transparent", "var(--shadow-glow-lg)", "var(--shadow-glow)"] } : {}}
//                 transition={{ delay: 0.3 + i * 0.4, duration: 1.2 }}
//                 className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary-glow/40 bg-deep">
//                 <I className="h-6 w-6 text-primary-glow" />
//               </motion.div>
//               <div>
//                 <p className="label md:mt-6">Step {i + 1}</p>
//                 <h3 className="mt-2 text-xl font-semibold">{title}</h3>
//                 <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

/* ---------- Pricing ---------- */
export function PricingSection() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div id="pricing">
          <SectionHeading eyebrow="Pricing" title={<>A Plan That Fits Your <span className="glow-text">Booth Business.</span></>}
            sub="Illustrative plans — final pricing coming soon." />
        </div>
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
    <section className="py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div id="faq">
          <SectionHeading eyebrow="FAQ" title={<>Got <span className="glow-text">Questions?</span></>} />
        </div>
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
