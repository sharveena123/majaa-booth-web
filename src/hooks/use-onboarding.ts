import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "majaa_onboarding_done_v1_";

export type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  /** DOM target for spotlight + tooltip (omit for centered welcome). */
  target?: string;
  placement?: "right" | "bottom";
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Majaa",
    body: "This is your business hub for photo booths — machines, bookings, revenue, and cloud galleries in one place. Your workspace starts empty so you only see your own data.",
  },
  {
    id: "overview",
    target: "nav-overview",
    placement: "right",
    title: "Overview",
    body: "Your home base — summary metrics and recent activity appear here as you add orders and link booths.",
  },
  {
    id: "machines",
    target: "nav-machines",
    placement: "right",
    title: "Machines",
    body: "Open this when you need to see paired booths, connectivity, and device status.",
  },
  {
    id: "orders",
    target: "nav-orders",
    placement: "right",
    title: "Orders & events",
    body: "Create and manage client bookings here — deposits, balances, and event status.",
  },
  {
    id: "revenue",
    target: "nav-revenue",
    placement: "right",
    title: "Revenue",
    body: "Charts and totals by event date — useful once you have bookings with pricing.",
  },
  {
    id: "settings",
    target: "nav-settings",
    placement: "right",
    title: "Settings",
    body: "Business profile, data export, and cloud gallery setup when you are ready.",
  },
];

/** Map dashboard nav paths to tour anchor ids. */
export function tourTargetForNavPath(to: string): string | undefined {
  const map: Record<string, string> = {
    "/dashboard": "nav-overview",
    "/dashboard/machines": "nav-machines",
    "/dashboard/orders": "nav-orders",
    "/dashboard/revenue": "nav-revenue",
    "/dashboard/settings": "nav-settings",
  };
  return map[to];
}

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function isOnboardingComplete(userId: string | undefined): boolean {
  if (!userId || typeof window === "undefined") return true;
  return localStorage.getItem(storageKey(userId)) === "1";
}

export function markOnboardingComplete(userId: string) {
  localStorage.setItem(storageKey(userId), "1");
}

export function resetOnboarding(userId: string) {
  localStorage.removeItem(storageKey(userId));
}

export function useOnboarding(userId: string | undefined) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!userId) {
      setOpen(false);
      return;
    }
    setOpen(!isOnboardingComplete(userId));
    setStepIndex(0);
  }, [userId]);

  const steps = ONBOARDING_STEPS;
  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;
  const isWelcome = step?.id === "welcome";

  const complete = useCallback(() => {
    if (userId) markOnboardingComplete(userId);
    setOpen(false);
  }, [userId]);

  const dismiss = useCallback(() => {
    complete();
  }, [complete]);

  const next = useCallback(() => {
    if (isLast) complete();
    else setStepIndex((i) => i + 1);
  }, [complete, isLast]);

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const replay = useCallback(() => {
    if (userId) resetOnboarding(userId);
    setStepIndex(0);
    setOpen(true);
  }, [userId]);

  return useMemo(
    () => ({
      open: !!userId && open,
      setOpen,
      step,
      stepIndex,
      steps,
      isLast,
      isWelcome,
      next,
      back,
      dismiss,
      replay,
    }),
    [userId, open, step, stepIndex, steps, isLast, isWelcome, next, back, dismiss, replay],
  );
}
