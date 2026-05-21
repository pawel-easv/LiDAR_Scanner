import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { env } from "../config/env.ts";

export const sql: NeonQueryFunction<false, false> = neon(env.databaseUrl);
