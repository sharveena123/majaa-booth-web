import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "@/data/marketing";
import { Logo } from "./primitives";

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-5 py-3 transition-all duration-500 ${
          scrolled || open ? "border-border bg-background/70 shadow-glow backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      >
        <Link to="/" aria-label="Majaa home"><Logo /></Link>
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <button onClick={() => scrollToId(l.id)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</button>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="px-3 text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</Link>
          <Link to="/signup" className="glow-btn !px-5 !py-2 text-sm">Get Started</Link>
        </div>
        <button className="md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="glass mx-auto mt-2 max-w-7xl bg-background/90 p-5 md:hidden"
          >
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => { setOpen(false); setTimeout(() => scrollToId(l.id), 50); }} className="block w-full py-3 text-left text-base">
                {l.label}
              </button>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/login" className="ghost-btn">Sign In</Link>
              <Link to="/signup" className="glow-btn">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
