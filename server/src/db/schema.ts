import type { ColumnType } from "kysely";

/** Matches PostgreSQL tables used by repositories (see existing INSERT/SELECT SQL). */
export interface Database {
  devices: DevicesTable;
  sweeps: SweepsTable;
  sweep_points: SweepPointsTable;
}

export interface DevicesTable {
  id: string;
  last_seen: ColumnType<Date, Date | undefined, Date>;
}

export interface SweepsTable {
  id: string;
  device_id: string;
  captured_at: string;
  received_at: string;
  area_m2: string | null;
  step_deg: number;
}

export interface SweepPointsTable {
  sweep_id: string;
  angle_deg: number;
  distance_cm: number;
}
