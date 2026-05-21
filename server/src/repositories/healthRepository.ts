import { sql } from "kysely";
import { db } from "../db/kysely.ts";

export async function pingDatabase(): Promise<boolean> {
  const row = await db
    .selectNoFrom(() => [sql<number>`1`.as("ok")])
    .executeTakeFirst();
  return row?.ok === 1;
}
