export interface SweepRecord {
  deviceId: string;
  deviceSeq: number | null;
  capturedAt: string;
  areaM2: number | null;
  stepDeg: number;
  points: { angleDeg: number; distanceCm: number }[];
}

/** Stable per sweep; duplicate MQTT deliveries share the same id and upsert. */
export function buildSweepId(deviceId: string, capturedAt: string): string {
  const slug = capturedAt.replace(/[:.]/g, "-");
  return `${deviceId}:cap-${slug}`;
}
