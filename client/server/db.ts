import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to dashboard/.env (see .env.example).",
  );
}

export const sql: NeonQueryFunction<false, false> = neon(connectionString);
