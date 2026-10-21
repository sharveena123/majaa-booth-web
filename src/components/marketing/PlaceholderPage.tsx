import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./primitives";

export function PlaceholderPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden canvas-bg px-6 py-10">
      <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
      <div className="relative mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back home</Link>
        </div>
        <div className="glass mt-16 p-8 sm:p-10">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="mt-6 space-y-4 text-muted-foreground">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function AuthPlaceholder({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  return (
    <PlaceholderPage title={isLogin ? "Welcome back" : "Create your Majaa account"}>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {!isLogin && (<div><label className="label" htmlFor="n">Business name</label><input id="n" className="field mt-2" /></div>)}
        <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" className="field mt-2" /></div>
        <div><label className="label" htmlFor="p">Password</label><input id="p" type="password" className="field mt-2" /></div>
        <button type="submit" className="glow-btn w-full">{isLogin ? "Sign In" : "Get Started"}</button>
        <p className="text-center text-sm">Accounts are coming soon.{" "}
          <Link to={isLogin ? "/signup" : "/login"} className="text-primary-glow">{isLogin ? "Create an account" : "Sign in instead"}</Link>
        </p>
      </form>
    </PlaceholderPage>
  );
}
