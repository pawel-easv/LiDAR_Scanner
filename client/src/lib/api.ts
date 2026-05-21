import type { SweepDetail, SweepSummary } from "@/types";

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
