import type { ReactNode } from "react";
import { cn } from "./cn";

type Tone = "success" | "danger" | "info" | "neutral";

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const toneStyles: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-600",
  danger: "bg-rose-50 text-rose-600",
  info: "bg-brand-50 text-brand-600",
  neutral: "bg-ink-100 text-ink-700",
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
