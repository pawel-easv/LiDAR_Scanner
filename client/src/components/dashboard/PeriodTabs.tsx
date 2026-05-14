import { Calendar } from "lucide-react";
import type { Period } from "@/types";
import { cn } from "@/components/ui/cn";

interface PeriodTabsProps {
  value: Period;
  onChange: (period: Period) => void;
  dateRange: string;
}

const periods: Period[] = ["Day", "Week", "Month"];

export function PeriodTabs({ value, onChange, dateRange }: PeriodTabsProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="inline-flex items-center rounded-xl bg-white border border-ink-200 p-1">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "h-9 px-4 rounded-lg text-sm font-medium transition",
              value === p
                ? "bg-brand-600 text-white shadow"
                : "text-ink-500 hover:text-ink-900",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <button className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-white border border-ink-200 text-sm text-ink-700 hover:bg-ink-100 transition">
        <Calendar className="h-4 w-4" />
        {dateRange}
      </button>
    </div>
  );
}
