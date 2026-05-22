/** Client mirror of server/src/dtos/sweeps.ts — keep in sync. */
export interface SweepPoint {
  angleDeg: number;
  distanceCm: number;
}

export interface SweepSummary {
  id: string;
  deviceId: string;
  roomId: string | null;
  roomName: string | null;
  capturedAt: string;
  receivedAt: string;
  areaM2: number | null;
  stepDeg: number;
  pointCount: number;
}

export interface SweepDetail extends Omit<SweepSummary, "pointCount"> {
  points: SweepPoint[];
}
