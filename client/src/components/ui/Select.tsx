import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
}

export function Select({
  options,
  placeholder,
  className,
  ...rest
}: SelectProps) {
  const isControlled = "value" in rest;
  const fallbackDefault = isControlled
    ? {}
    : { defaultValue: rest.defaultValue ?? "" };

  return (
    <div className="relative w-full">
      <select
        {...rest}
        {...fallbackDefault}
        className={cn(
          "w-full h-11 appearance-none rounded-xl border border-ink-200 bg-white px-4 pr-9 text-sm text-ink-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30",
          className,
        )}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
    </div>
  );
}
