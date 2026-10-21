import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { DashboardPreview } from "./DashboardPreview";
import { EASE, fadeUp, stagger } from "./primitives";
import { scrollToId } from "./Navbar";
import { RotatingWord } from "./RotatingWord";

const TRUST = ["Offline-ready events", "Instant cloud galleries", "Bookings & revenue in one place"];

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

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-6 xl:gap-8">
        <motion.div
          style={{ y: copyY, opacity: copyO }}
          variants={stagger(0.08, 0.05)}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full min-w-0 justify-self-start"
        >
          <motion.h1
            variants={fadeUp}
            className="mt-6 overflow-visible pb-2 text-[2.5rem] font-bold leading-[1.28] tracking-[-0.03em] sm:text-[3.25rem] xl:text-[3.75rem]"
          >
            <span className="text-foreground/95">Make every event feel </span>
            <RotatingWord className="text-[1.02em] sm:text-[1.04em]" />
            <span className="text-foreground/95"></span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Majaa runs your booth on the floor and your business in the cloud — AI moments, QR galleries, and bookings that
            actually stay organized.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/signup" className="glow-btn shadow-glow-lg">
              Get Started Free
            </Link>
            <button
              type="button"
              onClick={() => scrollToId("how-it-works")}
              className="ghost-btn !rounded-full !py-3 !text-sm"
            >
              See it in action
            </button>
          </motion.div>

          <motion.ul variants={fadeUp} className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <span className="h-1 w-1 rounded-full bg-primary-glow" />
                {item}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          style={{ y: dashY, scale: dashS }}
          className="relative w-full min-w-0 [perspective:2000px] lg:justify-self-end"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, rotateY: -35, rotateX: 20, x: 80 }}
            animate={{ opacity: 1, rotateY: -14, rotateX: 8, x: 0 }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
            className="relative origin-left max-lg:![transform:none] lg:w-full xl:w-[106%]"
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
