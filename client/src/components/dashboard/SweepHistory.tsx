import { Card, CardHeader } from "@/components/ui/Card";
import { formatAreaM2, formatDateTime } from "@/lib/format";
import type { SweepSummary } from "@/types";

interface SweepHistoryProps {
  entries: SweepSummary[];
}

export function SweepHistory({ entries }: SweepHistoryProps) {
  return (
    <Card>
      <CardHeader title="Sweep history" />

      {entries.length === 0 ? (
        <div className="py-10 text-center text-sm text-ink-500">
          No data yet. History will appear here once the ESP32 starts reporting.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-500">
                <th className="font-medium pb-3 pr-4">Captured</th>
                <th className="font-medium pb-3 pr-4">Device</th>
                <th className="font-medium pb-3 pr-4">Area (m²)</th>
                <th className="font-medium pb-3">Points</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-ink-100 text-ink-900"
                >
                  <td className="py-3 pr-4 text-ink-500">
                    {formatDateTime(entry.capturedAt)}
                  </td>
                  <td className="py-3 pr-4 font-medium">{entry.deviceId}</td>
                  <td className="py-3 pr-4 font-medium">
                    {formatAreaM2(entry.areaM2)}
                  </td>
                  <td className="py-3 text-ink-500">{entry.pointCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
