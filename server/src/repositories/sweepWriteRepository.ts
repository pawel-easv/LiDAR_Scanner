import { sql } from "kysely";
import { buildSweepId, type SweepRecord } from "../domain/sweepRecord.ts";
import { db } from "../db/kysely.ts";

export type SaveSweepResult = {
  id: string;
  inserted: boolean;
};

export async function saveSweep(sweep: SweepRecord): Promise<SaveSweepResult> {
  const receivedAt = new Date().toISOString();
  const sweepId = buildSweepId(sweep.deviceId, sweep.capturedAt);

  await db
    .insertInto("devices")
    .values({ id: sweep.deviceId, last_seen: new Date() })
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({ last_seen: new Date() }),
    )
    .execute();

  const row = await db
    .insertInto("sweeps")
    .values({
      id: sweepId,
      device_id: sweep.deviceId,
      captured_at: sweep.capturedAt,
      received_at: receivedAt,
      area_m2: sweep.areaM2 != null ? String(sweep.areaM2) : null,
      step_deg: sweep.stepDeg,
    })
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        area_m2: (eb) => eb.ref("excluded.area_m2"),
        captured_at: (eb) => eb.ref("excluded.captured_at"),
        received_at: (eb) => eb.ref("excluded.received_at"),
        step_deg: (eb) => eb.ref("excluded.step_deg"),
      }),
    )
    .returning(["id", sql<boolean>`(xmax = 0)`.as("inserted")])
    .executeTakeFirst();

  if (!row) {
    throw new Error(`sweep write returned no row for ${sweepId}`);
  }

  if (sweep.points.length > 0) {
    await db
      .insertInto("sweep_points")
      .values(
        sweep.points.map((point) => ({
          sweep_id: sweepId,
          angle_deg: point.angleDeg,
          distance_cm: point.distanceCm,
        })),
      )
      .onConflict((oc) =>
        oc.columns(["sweep_id", "angle_deg"]).doUpdateSet({
          distance_cm: (eb) => eb.ref("excluded.distance_cm"),
        }),
      )
      .execute();
  }

  return { id: row.id, inserted: row.inserted };
}
