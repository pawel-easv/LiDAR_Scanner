import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  BedDouble,
  Wrench,
  BedSingle,
  Hotel,
  Scan,
  Crosshair,
  Layers,
  Radio,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import type { Stat } from "@/types";

interface StatCardProps {
  stat: Stat;
  onDetails?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  area: Scan,
  points: Crosshair,
  sweeps: Layers,
  device: Radio,
  total: Hotel,
  available: BedDouble,
  filled: BedSingle,
  repair: Wrench,
};

export function StatCard({ stat, onDetails }: StatCardProps) {
  const Icon = iconMap[stat.id] ?? Scan;
  const showTrend = stat.trend != null && stat.delta != null;
  const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
  const trendColor = stat.trend === "up" ? "text-emerald-600" : "text-rose-600";
  const trendBg = stat.trend === "up" ? "bg-emerald-50" : "bg-rose-50";

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "h-10 w-10 rounded-xl grid place-items-center",
            stat.iconBg,
          )}
        >
          <Icon className={cn("h-5 w-5", stat.iconColor)} />
        </span>
        <span className="text-sm font-medium text-ink-500">{stat.label}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-ink-900 leading-none">
          {stat.value}
        </span>
        <span className="text-sm text-ink-500">{stat.unit}</span>
      </div>

      <div className="flex items-center justify-between min-h-[1.5rem]">
        {showTrend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
              trendBg,
              trendColor,
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {stat.delta}
          </span>
        ) : (
          <span className="text-xs text-ink-400">Live from device</span>
        )}
        {onDetails ? (
          <button
            type="button"
            onClick={onDetails}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Details <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </Card>
  );
}
