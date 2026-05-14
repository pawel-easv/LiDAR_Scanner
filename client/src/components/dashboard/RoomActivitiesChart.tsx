import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import type { ChartBar } from "@/types";

interface RoomActivitiesChartProps {
  data: ChartBar[];
  filterLabel?: string;
}

const yLabels = ["70-80", "50-60", "30-40", "10-20", "1-5"];
const maxValue = 80;

export function RoomActivitiesChart({
  data,
  filterLabel = "Today",
}: RoomActivitiesChartProps) {
  return (
    <Card>
      <CardHeader
        title="Room activities"
        action={
          <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
            {filterLabel}
          </button>
        }
      />

      <div className="relative h-64 grid grid-cols-[3rem_1fr] gap-3">
        <div className="flex flex-col justify-between text-xs text-ink-400 py-1">
          {yLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
            {yLabels.map((l) => (
              <div
                key={l}
                className="border-t border-dashed border-ink-200 first:border-0"
              />
            ))}
          </div>

          <div className="relative h-full flex items-end justify-between gap-3 px-1">
            {data.map((bar) => {
              const heightPct = Math.max(4, (bar.value / maxValue) * 100);
              return (
                <div
                  key={bar.day}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="relative w-full flex justify-center h-full items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={cn(
                        "w-7 rounded-lg transition-all",
                        bar.highlighted
                          ? "bg-brand-600"
                          : "bg-brand-100",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs",
                      bar.highlighted
                        ? "text-ink-900 font-semibold"
                        : "text-ink-500",
                    )}
                  >
                    {bar.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
