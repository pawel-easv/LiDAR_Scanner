import type { SweepDetail } from "./sweeps";

export interface RoomSummary {
  id: string;
  name: string;
  sweepCount: number;
  createdAt: string;
}

export interface RoomDetail {
  id: string;
  name: string;
  createdAt: string;
  sweeps: SweepDetail[];
}
