import type { RoomDetail, RoomSummary, SweepDetail, SweepSummary } from "@/types";

export interface DbHealth {
  status: "ok" | "down";
  database: string;
  latencyMs: number;
  checkedAt: string;
  error?: string;
}

async function parseJson<T>(res: Response): Promise<T | null> {
  return (await res.json().catch(() => null)) as T | null;
}

export async function fetchDbHealth(signal: AbortSignal): Promise<DbHealth> {
  const res = await fetch("/api/health", { signal });
  const body = await parseJson<DbHealth>(res);

  if (!body) {
    throw new Error(`Unexpected empty response (HTTP ${res.status})`);
  }

  if (!res.ok && body.status !== "down") {
    throw new Error(body.error ?? `Request failed (HTTP ${res.status})`);
  }

  return body;
}

export async function fetchSweeps(
  signal: AbortSignal,
): Promise<SweepSummary[]> {
  const res = await fetch("/api/sweeps", { signal });
  const body = await parseJson<SweepSummary[]>(res);

  if (!res.ok) {
    throw new Error(
      (body as { detail?: string } | null)?.detail ??
        `Failed to load sweeps (HTTP ${res.status})`,
    );
  }

  return body ?? [];
}

export async function fetchLatestSweep(
  signal: AbortSignal,
): Promise<SweepDetail | null> {
  const res = await fetch("/api/sweeps/latest", { signal });

  if (res.status === 404) return null;

  const body = await parseJson<SweepDetail>(res);

  if (!res.ok) {
    const detail = (body as { detail?: string } | null)?.detail;
    throw new Error(
      detail
        ? `${detail} (HTTP ${res.status})`
        : `Failed to load latest sweep (HTTP ${res.status})`,
    );
  }

  return body;
}

export async function fetchRooms(signal: AbortSignal): Promise<RoomSummary[]> {
  const res = await fetch("/api/rooms", { signal });
  const body = await parseJson<RoomSummary[]>(res);

  if (!res.ok) {
    throw new Error(
      (body as { detail?: string } | null)?.detail ??
        `Failed to load rooms (HTTP ${res.status})`,
    );
  }

  return body ?? [];
}

export async function createRoom(
  name: string,
  signal?: AbortSignal,
): Promise<RoomSummary> {
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
    signal,
  });
  const body = await parseJson<RoomSummary>(res);

  if (!res.ok) {
    throw new Error(
      (body as { detail?: string } | null)?.detail ??
        `Failed to create room (HTTP ${res.status})`,
    );
  }

  if (!body) {
    throw new Error(`Unexpected empty response (HTTP ${res.status})`);
  }

  return body;
}

export async function fetchRoomDetail(
  roomId: string,
  signal: AbortSignal,
): Promise<RoomDetail> {
  const res = await fetch(`/api/rooms/${roomId}`, { signal });
  const body = await parseJson<RoomDetail>(res);

  if (!res.ok) {
    throw new Error(
      (body as { detail?: string } | null)?.detail ??
        `Failed to load room (HTTP ${res.status})`,
    );
  }

  if (!body) {
    throw new Error(`Unexpected empty response (HTTP ${res.status})`);
  }

  return body;
}

export async function renameRoom(
  roomId: string,
  name: string,
  signal?: AbortSignal,
): Promise<RoomSummary> {
  const res = await fetch(`/api/rooms/${roomId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
    signal,
  });
  const body = await parseJson<RoomSummary>(res);

  if (!res.ok) {
    throw new Error(
      (body as { detail?: string } | null)?.detail ??
        `Failed to rename room (HTTP ${res.status})`,
    );
  }

  if (!body) {
    throw new Error(`Unexpected empty response (HTTP ${res.status})`);
  }

  return body;
}

export async function assignSweepRoom(
  sweepId: string,
  roomId: string | null,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`/api/sweeps/${sweepId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId }),
    signal,
  });

  if (!res.ok) {
    const body = await parseJson<{ detail?: string }>(res);
    throw new Error(
      body?.detail ?? `Failed to assign room (HTTP ${res.status})`,
    );
  }
}
