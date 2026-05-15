import express from "express";
import cors from "cors";
import { sql } from "./db.ts";

const app = express();
app.use(cors());

app.get("/api/health", async (_req, res) => {
  const startedAt = Date.now();
  try {
    const rows = await sql`SELECT 1 AS ok`;
    const ok = Array.isArray(rows) && rows[0]?.ok === 1;
    res.json({
      status: ok ? "ok" : "down",
      database: "neon",
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "down",
      database: "neon",
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

const port = Number(process.env.API_PORT ?? 5174);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});