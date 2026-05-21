export interface HealthDto {
  status: "ok" | "down";
  database: string;
  latencyMs: number;
  checkedAt: string;
  error?: string;
}
