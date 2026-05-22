/**
 * Wire-format contract for `/api/sweeps`. Keep these DTOs stable; any change
 * requires a matching update to the client types.
 */
export interface SweepPointDto {
  angleDeg: number;
  distanceCm: number;
}

export interface SweepSummaryDto {
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

export interface SweepDetailDto extends Omit<SweepSummaryDto, "pointCount"> {
  points: SweepPointDto[];
}
