import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
}

export function Input({ className, leftIcon, ...rest }: InputProps) {
  return (
    <label className="relative block w-full">
      {leftIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-400">
          {leftIcon}
        </span>
      ) : null}
      <input
        {...rest}
        className={cn(
          "w-full h-11 rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition",
          leftIcon ? "pl-10" : "",
          className,
        )}
      />
    </label>
  );
}
