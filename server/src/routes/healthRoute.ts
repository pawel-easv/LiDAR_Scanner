import { Router } from "express";
import { env } from "../config/env.ts";
import { pingDatabase } from "../repositories/healthRepository.ts";
import type { HealthDto } from "../dtos/health.ts";

export const healthRouter: Router = Router();

healthRouter.get("/health", async (_req, res) => {
  const startedAt = Date.now();

  try {
    const ok = await pingDatabase();
    const body: HealthDto = {
      status: ok ? "ok" : "down",
      database: env.databaseLabel,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    };
    res.status(ok ? 200 : 503).json(body);
  } catch (err) {
    const body: HealthDto = {
      status: "down",
      database: env.databaseLabel,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    };
    res.status(503).json(body);
  }
});
