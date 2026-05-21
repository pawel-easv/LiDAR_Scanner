import express, { type Express } from "express";
import cors from "cors";
import { healthRouter } from "./routes/healthRoute.ts";
import { sweepsRouter } from "./routes/sweepsRoute.ts";

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", healthRouter);
  app.use("/api/sweeps", sweepsRouter);
  return app;
}
