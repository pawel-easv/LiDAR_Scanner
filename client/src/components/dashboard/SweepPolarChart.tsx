import { Card, CardHeader } from "@/components/ui/Card";
import type { SweepPoint } from "@/types";

interface SweepPolarChartProps {
  points: SweepPoint[];
  title?: string;
}

const SIZE = 280;
const CENTER = SIZE / 2;
const MAX_RADIUS = CENTER - 16;

function toPolyline(points: SweepPoint[]): string {
  if (points.length === 0) return "";

  const maxCm = Math.max(...points.map((p) => p.distanceCm), 1);

  return points
    .map((p) => {
      const angleRad = (p.angleDeg * Math.PI) / 180;
      const r = (p.distanceCm / maxCm) * MAX_RADIUS;
      const x = CENTER + r * Math.sin(angleRad);
      const y = CENTER - r * Math.cos(angleRad);
      return `${x},${y}`;
    })
    .join(" ");
}

export function SweepPolarChart({
  points,
  title = "Latest scan profile",
}: SweepPolarChartProps) {
  const polyline = toPolyline(points);
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <Card>
      <CardHeader title={title} />

      <div className="flex justify-center py-2">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="text-ink-200"
          aria-label="Polar plot of LiDAR sweep distances"
        >
          {rings.map((scale) => (
            <circle
              key={scale}
              cx={CENTER}
              cy={CENTER}
              r={MAX_RADIUS * scale}
              fill="none"
              stroke="currentColor"
              strokeDasharray="4 4"
            />
          ))}
          <line
            x1={CENTER}
            y1={CENTER - MAX_RADIUS}
            x2={CENTER}
            y2={CENTER + MAX_RADIUS}
            stroke="currentColor"
          />
          <line
            x1={CENTER - MAX_RADIUS}
            y1={CENTER}
            x2={CENTER + MAX_RADIUS}
            y2={CENTER}
            stroke="currentColor"
          />
          {polyline && (
            <polyline
              points={polyline}
              fill="rgba(37, 99, 235, 0.12)"
              stroke="rgb(37, 99, 235)"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          )}
          <circle cx={CENTER} cy={CENTER} r={3} fill="rgb(37, 99, 235)" />
        </svg>
      </div>

      <p className="text-center text-xs text-ink-500 pb-2">
        {points.length} points · distances normalized to max range
      </p>
    </Card>
  );
}
