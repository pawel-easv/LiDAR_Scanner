import { Router } from "express";
import {
  getLatestSweepDetail,
  getSweepDetailById,
  listSweepSummaries,
} from "../repositories/sweepsRepository.ts";

export const sweepsRouter: Router = Router();

sweepsRouter.get("/", async (_req, res) => {
  try {
    const rows = await listSweepSummaries();
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/sweeps]", err);
    res.status(500).json({
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

sweepsRouter.get("/latest", async (_req, res) => {
  try {
    const sweep = await getLatestSweepDetail();
    if (!sweep) {
      res.status(404).json({ detail: "No sweeps found" });
      return;
    }
    res.json(sweep);
  } catch (err) {
    console.error("[GET /api/sweeps/latest]", err);
    res.status(500).json({
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

sweepsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === "latest") {
    res.status(400).json({ detail: "Use GET /api/sweeps/latest" });
    return;
  }

  try {
    const sweep = await getSweepDetailById(id);
    if (!sweep) {
      res.status(404).json({ detail: "Sweep not found" });
      return;
    }
    res.json(sweep);
  } catch (err) {
    console.error("[GET /api/sweeps/:id]", err);
    res.status(500).json({
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
