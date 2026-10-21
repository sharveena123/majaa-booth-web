import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

const signupSchema = z
  .object({
    businessName: z.string().min(2, "Business name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

type SignupValues = z.infer<typeof signupSchema>;

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Get Started — Majaa" },
      { name: "description", content: "Create your Majaa account and elevate your photo booth business." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, continueAsGuest, firebaseEnabled, mockAuthEnabled } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { businessName: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await signUp(values.email, values.password, values.businessName);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate({ to: "/dashboard" });
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
    navigate({ to: role === "superadmin" ? "/admin" : "/dashboard" });
  };

  return (
    <AuthShell title="Create your Majaa account" subtitle="Start managing booths, bookings, and galleries in one place.">
      {firebaseEnabled && (
        <div className="mb-6 space-y-3">
          <GoogleSignInButton onClick={onGoogle} loading={googleLoading} label="Sign up with Google" />
          <p className="text-center text-xs text-muted-foreground">or register with email</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="businessName">
            Business name
          </label>
          <input id="businessName" className="field mt-2" {...form.register("businessName")} />
          {form.formState.errors.businessName && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.businessName.message}</p>
          )}
        </div>
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
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirm password
          </label>
          <input id="confirm" type="password" className="field mt-2" {...form.register("confirm")} />
          {form.formState.errors.confirm && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.confirm.message}</p>
          )}
        </div>
        {error && <p className="whitespace-pre-line text-sm text-destructive">{error}</p>}
        <button type="submit" className="glow-btn w-full" disabled={form.formState.isSubmitting || !firebaseEnabled}>
          {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Started"}
        </button>
        {!firebaseEnabled && (
          <p className="text-center text-xs text-muted-foreground">
            Add Firebase env variables to enable registration, or use guest access below.
          </p>
        )}
      </form>

      {mockAuthEnabled && (
      <div className="mt-8 space-y-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            continueAsGuest("subscriber");
            navigate({ to: "/dashboard" });
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
            navigate({ to: "/admin" });
          }}
        >
          Continue as guest — Superadmin
        </Button>
      </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-glow hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
