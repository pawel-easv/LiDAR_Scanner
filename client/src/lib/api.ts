export interface DbHealth {
  status: "ok" | "down";
  database: string;
  latencyMs: number;
  checkedAt: string;
  error?: string;
}

export async function fetchDbHealth(signal: AbortSignal): Promise<DbHealth> {
  const res = await fetch("/api/health", { signal });
  const body = (await res.json().catch(() => null)) as DbHealth | null;

  if (!body) {
    throw new Error(`Unexpected empty response (HTTP ${res.status})`);
  }

  if (!res.ok && body.status !== "down") {
    throw new Error(body.error ?? `Request failed (HTTP ${res.status})`);
  }

  return body;
}
