import type { SweepDetailDto } from "./sweeps.ts";

export interface RoomSummaryDto {
  id: string;
  name: string;
  sweepCount: number;
  createdAt: string;
}

export interface RoomDetailDto {
  id: string;
  name: string;
  createdAt: string;
  sweeps: SweepDetailDto[];
}
