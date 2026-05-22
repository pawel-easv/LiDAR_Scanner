import { sql } from "kysely";
import { db } from "../db/kysely.ts";
import { mapSweepDetail } from "../lib/sweepMappers.ts";
import type { RoomDetailDto, RoomSummaryDto } from "../dtos/rooms.ts";

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function defaultSweepRoomName(deviceId: string): string {
  return `Room · ${deviceId}`;
}

/** One room per sweep; renames affect only that sweep's row. */
export async function ensureSweepRoom(
  sweepId: string,
  deviceId: string,
): Promise<string> {
  const existing = await db
    .selectFrom("rooms")
    .select("id")
    .where("id", "=", sweepId)
    .executeTakeFirst();

  if (existing) return existing.id;

  try {
    await db
      .insertInto("rooms")
      .values({
        id: sweepId,
        name: defaultSweepRoomName(deviceId),
        device_id: null,
      })
      .execute();
    return sweepId;
  } catch {
    const raced = await db
      .selectFrom("rooms")
      .select("id")
      .where("id", "=", sweepId)
      .executeTakeFirst();
    if (raced) return raced.id;
    throw new Error(`Failed to ensure room for sweep ${sweepId}`);
  }
}

export async function renameRoom(
  id: string,
  name: string,
): Promise<RoomSummaryDto> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Room name is required");
  }

  const row = await db
    .updateTable("rooms")
    .set({ name: trimmed })
    .where("id", "=", id)
    .returning(["id", "name", "created_at"])
    .executeTakeFirst();

  if (!row) throw new Error("Room not found");

  const count = await db
    .selectFrom("sweeps")
    .select(sql<number>`count(*)::int`.as("count"))
    .where("room_id", "=", id)
    .executeTakeFirst();

  return {
    id: row.id,
    name: row.name,
    sweepCount: Number(count?.count ?? 0),
    createdAt: toIso(row.created_at),
  };
}

export async function listRooms(): Promise<RoomSummaryDto[]> {
  const rows = await db
    .selectFrom("rooms as r")
    .leftJoin("sweeps as s", "s.room_id", "r.id")
    .select([
      "r.id",
      "r.name",
      "r.created_at",
      sql<number>`count(s.id)::int`.as("sweep_count"),
    ])
    .groupBy(["r.id", "r.name", "r.created_at"])
    .orderBy("r.name", "asc")
    .execute();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sweepCount: Number(row.sweep_count),
    createdAt: toIso(row.created_at),
  }));
}

export async function createRoom(name: string): Promise<RoomSummaryDto> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Room name is required");
  }

  const id = crypto.randomUUID();
  const row = await db
    .insertInto("rooms")
    .values({ id, name: trimmed })
    .returning(["id", "name", "created_at"])
    .executeTakeFirstOrThrow();

  return {
    id: row.id,
    name: row.name,
    sweepCount: 0,
    createdAt: toIso(row.created_at),
  };
}

export async function getRoomDetailById(
  id: string,
): Promise<RoomDetailDto | null> {
  const room = await db
    .selectFrom("rooms")
    .select(["id", "name", "created_at"])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!room) return null;

  const sweeps = await db
    .selectFrom("sweeps")
    .select([
      "id",
      "device_id",
      "captured_at",
      "received_at",
      "area_m2",
      "step_deg",
    ])
    .where("room_id", "=", id)
    .orderBy("received_at", "desc")
    .execute();

  const sweepsWithPoints = await Promise.all(
    sweeps.map(async (sweep) => {
      const points = await db
        .selectFrom("sweep_points")
        .select(["angle_deg", "distance_cm"])
        .where("sweep_id", "=", sweep.id)
        .orderBy("angle_deg", "asc")
        .execute();
      return mapSweepDetail(sweep, points);
    }),
  );

  return {
    id: room.id,
    name: room.name,
    createdAt: toIso(room.created_at),
    sweeps: sweepsWithPoints,
  };
}

export async function assignSweepToRoom(
  sweepId: string,
  roomId: string | null,
): Promise<boolean> {
  if (roomId) {
    const room = await db
      .selectFrom("rooms")
      .select("id")
      .where("id", "=", roomId)
      .executeTakeFirst();
    if (!room) throw new Error("Room not found");
  }

  const result = await db
    .updateTable("sweeps")
    .set({ room_id: roomId })
    .where("id", "=", sweepId)
    .executeTakeFirst();

  return Number(result.numUpdatedRows) > 0;
}
