import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { ScansPerDayChart } from "@/components/dashboard/ScansPerDayChart";
import { FetchStateBlock } from "@/components/dashboard/FetchStateBlock";
import { StatCard } from "@/components/dashboard/StatCard";
import { SweepHistory } from "@/components/dashboard/SweepHistory";
import { SweepPolarChart } from "@/components/dashboard/SweepPolarChart";
import { Card } from "@/components/ui/Card";
import { formatAreaM2, formatDateTime } from "@/lib/format";
import { useRooms } from "@/hooks/useRooms";
import { useLatestSweep, useSweepHistory } from "@/hooks/useSweeps";
import type { Stat } from "@/types";

function buildStats(
  latestArea: number | null | undefined,
  sweepCount: number,
  deviceId: string | undefined,
): Stat[] {
  return [
    {
      id: "area",
      label: "Latest scan area",
      value: formatAreaM2(latestArea ?? null),
      unit: "m²",
      iconBg: "bg-brand-100",
      iconColor: "text-brand-600",
    },
    {
      id: "sweeps",
      label: "Stored sweeps",
      value: sweepCount,
      unit: "scans",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      id: "device",
      label: "Device",
      value: deviceId ?? "—",
      unit: "",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];
}

export function Dashboard() {
  const latest = useLatestSweep(5_000);
  const history = useSweepHistory(5_000);
  const rooms = useRooms(5_000);

  const stats = useMemo(() => {
    const latestData = latest.status === "success" ? latest.data : null;
    const historyData = history.status === "success" ? history.data : [];
    return buildStats(
      latestData?.areaM2,
      historyData.length,
      latestData?.deviceId ?? historyData[0]?.deviceId,
    );
  }, [latest, history]);

  const dateRange =
    latest.status === "success" && latest.data
      ? `Last scan · ${formatDateTime(latest.data.capturedAt)}`
      : "Waiting for first sweep";

  const historySweeps =
    history.status === "success" ? history.data : [];

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-6 flex flex-col gap-5">
        <Topbar title="LiDAR Scanner" userName="Polish Power" />

        <p className="text-sm text-ink-500">{dateRange}</p>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <FetchStateBlock
            state={latest}
            onRetry={latest.refetch}
            loadingLabel="Loading latest sweep…"
            emptyLabel="No sweeps yet. Data will appear when the ESP32 reports to Flespi."
          >
            {(data) => <SweepPolarChart points={data.points} />}
          </FetchStateBlock>

          {history.status === "loading" && historySweeps.length === 0 ? (
            <Card className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading sweep history…
            </Card>
          ) : history.status === "error" ? (
            <Card className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-sm text-red-600">{history.error.message}</p>
              <button
                type="button"
                onClick={history.refetch}
                className="text-sm font-medium text-brand-600"
              >
                Retry
              </button>
            </Card>
          ) : (
            <ScansPerDayChart sweeps={historySweeps} />
          )}
        </section>

        <section className="grid grid-cols-1 gap-5">
          <FetchStateBlock
            state={history}
            onRetry={history.refetch}
            loadingLabel="Loading sweep history…"
            emptyLabel="No sweep history yet."
          >
            {(data) => (
              <SweepHistory
                entries={data}
                onRoomsChange={rooms.refetch}
                onSweepsChange={history.refetch}
              />
            )}
          </FetchStateBlock>
        </section>
      </div>
    </div>
  );
}
