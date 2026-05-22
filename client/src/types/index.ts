export type {
  SweepDetail,
  SweepPoint,
  SweepSummary,
} from "./sweeps.ts";

export type { RoomDetail, RoomSummary } from "./rooms.ts";

export type Trend = "up" | "down";

export interface Stat {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  trend?: Trend;
  delta?: string;
  iconBg: string;
  iconColor: string;
}

export interface ChartBar {
  day: string;
  value: number;
  highlighted?: boolean;
}

export type Period = "Day" | "Week" | "Month";

export interface RoomHistoryEntry {
  id: string;
  room: string;
  enteredAt: string;
  leftAt: string | null;
  status: "Occupied" | "Vacated";
}
