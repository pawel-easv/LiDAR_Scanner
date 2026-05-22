import type { SweepDetailDto, SweepSummaryDto } from "../dtos/sweeps.ts";

export function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function toAreaM2(value: string | number | null): number | null {
  if (value == null) return null;
  return Number(value);
}

export function mapSweepSummary(row: {
  id: string;
  device_id: string;
  room_id?: string | null;
  room_name?: string | null;
  captured_at: Date | string;
  received_at: Date | string;
  area_m2: string | number | null;
  step_deg: number;
  point_count: string | number | bigint;
}): SweepSummaryDto {
  return {
    id: row.id,
    deviceId: row.device_id,
    roomId: row.room_id ?? null,
    roomName: row.room_name ?? null,
    capturedAt: toIso(row.captured_at),
    receivedAt: toIso(row.received_at),
    areaM2: toAreaM2(row.area_m2),
    stepDeg: row.step_deg,
    pointCount: Number(row.point_count),
  };
}

export function mapSweepDetail(
  sweep: {
    id: string;
    device_id: string;
    room_id?: string | null;
    room_name?: string | null;
    captured_at: Date | string;
    received_at: Date | string;
    area_m2: string | number | null;
    step_deg: number;
  },
  points: { angle_deg: number; distance_cm: number }[],
): SweepDetailDto {
  return {
    id: sweep.id,
    deviceId: sweep.device_id,
    roomId: sweep.room_id ?? null,
    roomName: sweep.room_name ?? null,
    capturedAt: toIso(sweep.captured_at),
    receivedAt: toIso(sweep.received_at),
    areaM2: toAreaM2(sweep.area_m2),
    stepDeg: sweep.step_deg,
    points: points.map((p) => ({
      angleDeg: p.angle_deg,
      distanceCm: Number(p.distance_cm),
    })),
  };
}
