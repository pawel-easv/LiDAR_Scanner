import { neon } from "@neondatabase/serverless";
import { Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";
import { env } from "../config/env.ts";
import type { Database } from "./schema.ts";

export const db = new Kysely<Database>({
  dialect: new NeonDialect({
    neon: neon(env.databaseUrl),
  }),
});
