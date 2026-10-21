import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { DashboardPreview } from "./DashboardPreview";
import { EASE, fadeUp, stagger } from "./primitives";
import { scrollToId } from "./Navbar";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const copyO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const dashY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const dashS = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.9]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-24 pt-36 lg:min-h-screen lg:pb-32 lg:pt-40">
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 canvas-bg opacity-60" />
      <motion.div style={{ x: glowX }} className="pointer-events-none absolute -right-40 top-10 h-[640px] w-[640px] rounded-full bg-primary/25 blur-[140px] animate-drift" />
      <div className="pointer-events-none absolute left-[-10%] top-[40%] h-[380px] w-[380px] rounded-full bg-highlight/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-6">
        <motion.div style={{ y: copyY, opacity: copyO }} variants={stagger(0.1, 0.1)} initial="hidden" animate="show" className="relative z-10">
          <motion.button variants={fadeUp} onClick={() => scrollToId("features")} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-sm">
            <span className="rounded-full bg-gradient-primary px-2.5 py-0.5 text-xs font-semibold">NEW</span>
            <span className="text-muted-foreground">Meet the next generation of photo booths</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary-glow" />
          </motion.button>
          <motion.h1 variants={fadeUp} className="mt-7 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
            Your Photo Booth<br />Business.<br /><span className="glow-text">Elevated.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Powerful photo booth software, AI experiences, instant cloud galleries, and business management — all in one seamless platform.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/signup" className="glow-btn">Get Started</Link>
            <button onClick={() => scrollToId("showcase")} className="group inline-flex items-center gap-2 px-2 font-medium">
              Explore the Platform <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-10 text-sm text-muted-foreground">Built for modern photo booth professionals.</motion.p>
        </motion.div>

        <motion.div style={{ y: dashY, scale: dashS }} className="relative [perspective:2000px]">
          <motion.div
            initial={reduce ? false : { opacity: 0, rotateY: -35, rotateX: 20, x: 80 }}
            animate={{ opacity: 1, rotateY: -14, rotateX: 8, x: 0 }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
            className="relative origin-left max-lg:![transform:none] lg:w-[130%]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="animate-float-slow">
              <DashboardPreview />
            </div>
            {/* floating chips */}
            <div className="glass absolute -left-6 top-1/3 hidden !rounded-2xl bg-deep/90 px-4 py-3 text-xs animate-float lg:block" style={{ transform: "translateZ(60px)" }}>
              <p className="text-muted-foreground">New booking</p>
              <p className="font-semibold">Wedding · RM2,400</p>
            </div>
            <div className="glass absolute -bottom-6 left-1/4 hidden !rounded-2xl bg-deep/90 px-4 py-3 text-xs lg:block" style={{ transform: "translateZ(90px)", animation: "float-y 7s ease-in-out infinite 1s" }}>
              <p className="text-muted-foreground">Gallery uploaded</p>
              <p className="font-semibold text-primary-glow">248 photos · QR ready</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
