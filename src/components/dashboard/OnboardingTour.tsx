import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOnboarding } from "@/hooks/use-onboarding";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

function findVisibleTourTarget(targetId: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${targetId}"]`);
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && el.offsetParent !== null) return el;
  }
  return nodes[0] ?? null;
}

function measureTarget(targetId: string): Rect | null {
  const el = findVisibleTourTarget(targetId);
  if (!el) return null;
  el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  const r = el.getBoundingClientRect();
  const pad = 6;
  return {
    top: r.top - pad,
    left: r.left - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
}

function TourTooltip({
  rect,
  placement,
  stepIndex,
  totalSteps,
  title,
  body,
  onBack,
  onNext,
  onDismiss,
  isLast,
  canBack,
}: {
  rect: Rect;
  placement: "right" | "bottom";
  stepIndex: number;
  totalSteps: number;
  title: string;
  body: string;
  onBack: () => void;
  onNext: () => void;
  onDismiss: () => void;
  isLast: boolean;
  canBack: boolean;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [arrow, setArrow] = useState<"left" | "top">("left");

  useLayoutEffect(() => {
    const cardW = 320;
    const cardH = 220;
    const gap = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0;
    let left = 0;
    let arrowSide: "left" | "top" = placement === "right" ? "left" : "top";

    if (placement === "right" && rect.left + rect.width + gap + cardW < vw - 12) {
      left = rect.left + rect.width + gap;
      top = rect.top + rect.height / 2 - cardH / 2;
      arrowSide = "left";
    } else if (rect.top + rect.height + gap + cardH < vh - 12) {
      left = rect.left + rect.width / 2 - cardW / 2;
      top = rect.top + rect.height + gap;
      arrowSide = "top";
    } else {
      left = Math.min(vw - cardW - 12, rect.left + rect.width + gap);
      top = Math.max(12, rect.top + rect.height / 2 - cardH / 2);
      arrowSide = "left";
    }

    top = Math.max(12, Math.min(vh - cardH - 12, top));
    left = Math.max(12, Math.min(vw - cardW - 12, left));
    setPos({ top, left });
    setArrow(arrowSide);
  }, [rect, placement]);

  return (
    <div
      className="fixed z-[110] w-[min(320px,calc(100vw-24px))] rounded-2xl border border-primary/30 bg-deep p-4 shadow-glow-lg"
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-labelledby="tour-title"
    >
      {arrow === "left" && (
        <span
          className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-primary/30 bg-deep"
          aria-hidden
        />
      )}
      {arrow === "top" && (
        <span
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-primary/30 bg-deep"
          aria-hidden
        />
      )}

      <div className="mb-1 flex items-center gap-2 text-primary-glow">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Step {stepIndex + 1} of {totalSteps}
        </span>
      </div>
      <h3 id="tour-title" className="text-base font-semibold">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <p className="mt-2 text-xs text-primary-glow/90">Use this item in the sidebar when you are ready.</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
          Skip tour
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!canBack} onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            {isLast ? "Done" : "Next"}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AnchoredTourStep({
  targetId,
  placement,
  stepIndex,
  totalSteps,
  title,
  body,
  onBack,
  onNext,
  onDismiss,
  isLast,
  canBack,
}: {
  targetId: string;
  placement: "right" | "bottom";
  stepIndex: number;
  totalSteps: number;
  title: string;
  body: string;
  onBack: () => void;
  onNext: () => void;
  onDismiss: () => void;
  isLast: boolean;
  canBack: boolean;
}) {
  const [rect, setRect] = useState<Rect | null>(null);

  const update = useCallback(() => {
    setRect(measureTarget(targetId));
  }, [targetId]);

  useLayoutEffect(() => {
    if (targetId.startsWith("nav-") && targetId !== "nav-menu-mobile" && window.innerWidth < 1024) {
      window.dispatchEvent(new Event("majaa-tour-open-nav"));
    }
    update();
    const t = window.setTimeout(update, 450);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [update]);

  if (!rect) {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4">
        <p className="rounded-xl bg-deep px-4 py-3 text-sm text-muted-foreground">Loading tour…</p>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/50" aria-hidden onClick={onDismiss} />
      <div
        className={cn(
          "pointer-events-none fixed z-[105] rounded-xl ring-2 ring-primary-glow",
          "shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-[top,left,width,height] duration-300",
        )}
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />
      <TourTooltip
        rect={rect}
        placement={placement}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        title={title}
        body={body}
        onBack={onBack}
        onNext={onNext}
        onDismiss={onDismiss}
        isLast={isLast}
        canBack={canBack}
      />
    </>,
    document.body,
  );
}

export function OnboardingTour({ userId }: { userId: string | undefined }) {
  const navigate = useNavigate();
  const { open, step, stepIndex, steps, isLast, isWelcome, next, back, dismiss } = useOnboarding(userId);

  useEffect(() => {
    if (!open || isWelcome) return;
    if (!step.target?.startsWith("nav-")) return;
    const onDashboard =
      window.location.pathname === "/dashboard" ||
      window.location.pathname.startsWith("/dashboard/");
    if (!onDashboard) {
      navigate({ to: "/dashboard" });
    }
  }, [open, isWelcome, step.target, navigate]);

  if (!open) return null;

  if (isWelcome) {
    return (
      <Dialog
        open
        onOpenChange={(next) => {
          if (!next) dismiss();
        }}
      >
        <DialogContent className="border-border bg-deep sm:max-w-md">
          <DialogHeader>
            <div className="mb-1 flex items-center gap-2 text-primary-glow">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Step {stepIndex + 1} of {steps.length}
              </span>
            </div>
            <DialogTitle>{step.title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">{step.body}</DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Next, we will walk through the sidebar — where to click for each area.</p>
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
              Skip tour
            </Button>
            <Button type="button" size="sm" onClick={next}>
              Show me around
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!step.target) return null;

  return (
    <AnchoredTourStep
      targetId={step.target}
      placement={step.placement ?? "right"}
      stepIndex={stepIndex}
      totalSteps={steps.length}
      title={step.title}
      body={step.body}
      onBack={back}
      onNext={next}
      onDismiss={dismiss}
      isLast={isLast}
      canBack={stepIndex > 0}
    />
  );
}
