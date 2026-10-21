import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(4, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Sign In — Majaa" },
      { name: "description", content: "Sign in to your Majaa photo booth business account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, login, loginWithGoogle, continueAsGuest, firebaseEnabled, mockAuthEnabled } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const afterAuth = (role: "subscriber" | "superadmin") => {
    const fallback = role === "superadmin" ? "/admin" : "/dashboard";
    navigate({ to: (redirect as "/" | "/dashboard" | "/admin") || fallback });
  };

  useEffect(() => {
    if (user?.authProvider === "firebase") {
      afterAuth(user.role === "superadmin" ? "superadmin" : "subscriber");
    }
  }, [user]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await login(values.email, values.password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const role = getSession()?.role ?? "subscriber";
    afterAuth(role);
  });

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.redirect) {
      return;
    }
    const role = getSession()?.role ?? "subscriber";
    afterAuth(role);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage booths, orders, and revenue.">
      {firebaseEnabled && (
        <div className="mb-6 space-y-3">
          <GoogleSignInButton onClick={onGoogle} loading={googleLoading} />
          <p className="text-center text-xs text-muted-foreground">or sign in with email</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" className="field mt-2" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="field pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        {error && <p className="whitespace-pre-line text-sm text-destructive">{error}</p>}
        <button type="submit" className="glow-btn w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
        </button>
      </form>

      {mockAuthEnabled && (
      <div className="mt-8 space-y-3 border-t border-border pt-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Development shortcuts
        </p>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            continueAsGuest("subscriber");
            afterAuth("subscriber");
          }}
        >
          Continue as guest — Subscriber
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full border-border"
          onClick={() => {
            continueAsGuest("superadmin");
            afterAuth("superadmin");
          }}
        >
          Continue as guest — Superadmin
        </Button>
      </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/signup" className="text-primary-glow hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
