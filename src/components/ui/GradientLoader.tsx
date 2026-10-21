import { cn } from "@/lib/utils";

type GradientLoaderProps = {
  /** Centered in content area (no background panel). */
  variant?: "inline" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-6 w-6",
  md: "h-9 w-9",
  lg: "h-11 w-11",
} as const;

export function GradientLoader({ variant = "inline", size = "md", className }: GradientLoaderProps) {
  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      className={cn("gradient-spinner shrink-0", sizes[size], className)}
    />
  );

  if (variant === "center") {
    return (
      <div className="flex min-h-[min(240px,50vh)] w-full items-center justify-center py-12">{spinner}</div>
    );
  }

  return spinner;
}
