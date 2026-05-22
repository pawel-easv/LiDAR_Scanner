import { Router } from "express";
import {
  createRoom,
  getRoomDetailById,
  listRooms,
  renameRoom,
} from "../repositories/roomsRepository.ts";

export const roomsRouter: Router = Router();

roomsRouter.get("/", async (_req, res) => {
  try {
    const rows = await listRooms();
    res.json(rows);
  } catch (err) {
    console.error("[GET /api/rooms]", err);
    res.status(500).json({
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

roomsRouter.post("/", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name : "";

  try {
    const room = await createRoom(name);
    res.status(201).json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = 400;
    console.error("[POST /api/rooms]", err);
    res.status(status).json({ detail: message });
  }
});

roomsRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const name = typeof req.body?.name === "string" ? req.body.name : "";

  try {
    const room = await renameRoom(id, name);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message === "Room not found" ? 404 : 400;
    console.error("[PATCH /api/rooms/:id]", err);
    res.status(status).json({ detail: message });
  }
});

roomsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const room = await getRoomDetailById(id);
    if (!room) {
      res.status(404).json({ detail: "Room not found" });
      return;
    }
    res.json(room);
  } catch (err) {
    console.error("[GET /api/rooms/:id]", err);
    res.status(500).json({
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
