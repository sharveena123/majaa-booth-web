import { cn } from "@/lib/utils";
import { GradientLoader } from "@/components/ui/GradientLoader";
import type { ReactNode } from "react";

export function LoadingFade({
  loading,
  children,
  className,
  minHeight = true,
}: {
  loading: boolean;
  children: ReactNode;
  className?: string;
  minHeight?: boolean;
}) {
  return (
    <div className={cn("relative", minHeight && "min-h-[min(240px,50vh)]", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" aria-hidden={!loading}>
          <GradientLoader size="md" />
        </div>
      )}
      <div
        className={cn(
          "transition-opacity duration-500 ease-out motion-reduce:transition-none",
          loading ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        {children}
      </div>
    </div>
  );
}
