import { sql } from "kysely";
import { db } from "../db/kysely.ts";
import { mapSweepDetail, mapSweepSummary } from "../lib/sweepMappers.ts";
import type { SweepDetailDto, SweepSummaryDto } from "../dtos/sweeps.ts";

export async function listSweepSummaries(): Promise<SweepSummaryDto[]> {
  const rows = await db
    .selectFrom("sweeps as s")
    .leftJoin("sweep_points as p", "p.sweep_id", "s.id")
    .select([
      "s.id",
      "s.device_id",
      "s.captured_at",
      "s.received_at",
      "s.area_m2",
      "s.step_deg",
      sql<number>`count(p.angle_deg)::int`.as("point_count"),
    ])
    .groupBy([
      "s.id",
      "s.device_id",
      "s.captured_at",
      "s.received_at",
      "s.area_m2",
      "s.step_deg",
    ])
    .orderBy("s.received_at", "desc")
    .execute();

  return rows.map(mapSweepSummary);
}

async function loadSweepPoints(sweepId: string) {
  return db
    .selectFrom("sweep_points")
    .select(["angle_deg", "distance_cm"])
    .where("sweep_id", "=", sweepId)
    .orderBy("angle_deg", "asc")
    .execute();
}

export async function getSweepDetailById(
  id: string,
): Promise<SweepDetailDto | null> {
  const sweep = await db
    .selectFrom("sweeps")
    .select([
      "id",
      "device_id",
      "captured_at",
      "received_at",
      "area_m2",
      "step_deg",
    ])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!sweep) return null;

  const points = await loadSweepPoints(sweep.id);
  return mapSweepDetail(sweep, points);
}

export async function getLatestSweepDetail(): Promise<SweepDetailDto | null> {
  const sweep = await db
    .selectFrom("sweeps")
    .select([
      "id",
      "device_id",
      "captured_at",
      "received_at",
      "area_m2",
      "step_deg",
    ])
    .orderBy("received_at", "desc")
    .limit(1)
    .executeTakeFirst();

  if (!sweep) return null;

  const points = await loadSweepPoints(sweep.id);
  return mapSweepDetail(sweep, points);
}
