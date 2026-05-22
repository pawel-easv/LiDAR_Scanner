import { useMemo } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  buildLastNDayKeys,
  formatDayLabel,
  toLocalDayKey,
} from "@/lib/format";
import type { SweepSummary } from "@/types";

const DAY_COUNT = 7;

interface ScansPerDayChartProps {
  sweeps: SweepSummary[];
}

export function ScansPerDayChart({ sweeps }: ScansPerDayChartProps) {
  const days = useMemo(() => {
    const dayKeys = buildLastNDayKeys(DAY_COUNT);
    const counts = new Map<string, number>();
    for (const sweep of sweeps) {
      const key = toLocalDayKey(sweep.capturedAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return dayKeys.map((dayKey) => ({
      dayKey,
      label: formatDayLabel(dayKey),
      count: counts.get(dayKey) ?? 0,
      isToday: dayKey === toLocalDayKey(new Date()),
    }));
  }, [sweeps]);

  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const todayCount = days.find((d) => d.isToday)?.count ?? 0;

  return (
    <Card>
      <CardHeader
        title="Scans per day"
        action={
          <span className="text-sm font-medium text-ink-500">
            Today ·{" "}
            <span className="text-ink-900 font-semibold">{todayCount}</span>
          </span>
        }
      />

      <div className="h-64 flex items-end justify-between gap-2 px-1 pb-2">
        {days.map((day) => {
          const heightPct = Math.max(4, (day.count / maxCount) * 100);
          return (
            <div
              key={day.dayKey}
              className="flex flex-col items-center gap-2 flex-1 min-w-0"
              title={`${day.label}: ${day.count} scan${day.count === 1 ? "" : "s"}`}
            >
              <span
                className={
                  day.isToday
                    ? "text-xs font-semibold text-brand-600"
                    : "text-xs font-medium text-ink-600"
                }
              >
                {day.count}
              </span>
              <div className="relative w-full flex justify-center h-44 items-end">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={
                    day.isToday
                      ? "w-full max-w-8 rounded-lg bg-brand-600"
                      : "w-full max-w-8 rounded-lg bg-brand-100"
                  }
                />
              </div>
              <span
                className={
                  day.isToday
                    ? "text-[10px] font-semibold text-brand-600 truncate w-full text-center"
                    : "text-[10px] text-ink-500 truncate w-full text-center"
                }
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
