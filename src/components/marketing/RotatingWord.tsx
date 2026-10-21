import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { EASE } from "./primitives";

const DEFAULT_WORDS = ["unforgettable", "premium", "effortless", "magnetic", "iconic"] as const;

export function RotatingWord({
  words = DEFAULT_WORDS,
  intervalMs = 2800,
  className = "",
}: {
  words?: readonly string[];
  intervalMs?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const list = useMemo(() => [...words], [words]);
  const current = list[index % list.length];

  const longest = useMemo(
    () => list.reduce((a, b) => (a.length >= b.length ? a : b), list[0] ?? ""),
    [list],
  );

  useEffect(() => {
    if (reduce || list.length <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % list.length), intervalMs);
    return () => window.clearInterval(id);
  }, [reduce, list.length, intervalMs]);

  const boxClass =
    "col-start-1 row-start-1 whitespace-nowrap px-0.5 pb-[0.38em] pt-[0.06em] font-bold capitalize leading-[1.35]";

  return (
    <span
      className={`relative inline-grid overflow-visible align-baseline ${className}`}
      style={{ gridTemplateColumns: "1fr" }}
      aria-live="polite"
    >
      <span className={`invisible ${boxClass}`} aria-hidden>
        {longest}
      </span>
      <span className={`${boxClass} overflow-visible`}>
        {reduce ? (
          <span className="glow-text glow-text-descenders inline-block">{current}</span>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current}
              initial={{ opacity: 0, y: "0.28em", filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: "-0.28em", filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="glow-text glow-text-descenders inline-block will-change-transform"
            >
              {current}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </span>
  );
}
