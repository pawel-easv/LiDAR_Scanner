import type { SweepRecord } from "../domain/sweepRecord.ts";

const LIDAR_TOPIC_RE = /^lidar\/([^/]+)\/sweep$/;
const FLESPI_DEVICE_TOPIC_RE = /^flespi\/message\/gw\/devices\/([^/]+)/;

function deviceIdFromTopic(topic: string): string | null {
  const lidar = topic.match(LIDAR_TOPIC_RE);
  if (lidar?.[1]) return lidar[1];

  const flespi = topic.match(FLESPI_DEVICE_TOPIC_RE);
  if (flespi?.[1]) return flespi[1];

  return null;
}

function unwrapPayload(parsed: unknown): Record<string, unknown> | null {
  if (!parsed) return null;

  if (Array.isArray(parsed)) {
    const first = parsed[0];
    return first && typeof first === "object"
      ? (first as Record<string, unknown>)
      : null;
  }

  if (typeof parsed !== "object") return null;

  const obj = parsed as Record<string, unknown>;

  if (obj.payload && typeof obj.payload === "object") {
    return obj.payload as Record<string, unknown>;
  }

  if (obj.data && typeof obj.data === "object") {
    return obj.data as Record<string, unknown>;
  }

  return obj;
}

function readString(raw: unknown): string | null {
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  return null;
}

function readNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.length > 0) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function readIsoTime(raw: unknown): string | null {
  if (typeof raw !== "string" || Number.isNaN(Date.parse(raw))) return null;
  return new Date(raw).toISOString();
}

function parseDistances(
  raw: unknown,
  stepDeg: number,
): { angleDeg: number; distanceCm: number }[] {
  if (!Array.isArray(raw)) return [];

  const points: { angleDeg: number; distanceCm: number }[] = [];
  for (let i = 0; i < raw.length; i++) {
    const d = raw[i];
    if (typeof d !== "number" || !Number.isFinite(d) || d <= 0) continue;
    points.push({ angleDeg: i * stepDeg, distanceCm: d });
  }
  return points;
}

/**
 * Accepts payloads from:
 * - Custom MQTT `lidar/{deviceId}/sweep` (full distances array)
 * - Flespi `flespi/message/gw/devices/{id}` (ESP HTTP: scanned_area_m2, timestamp)
 */
export function parseFlespiSweepMessage(
  topic: string,
  payload: Buffer,
): SweepRecord | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload.toString("utf8"));
  } catch {
    return null;
  }

  const raw = unwrapPayload(parsed);
  if (!raw) return null;

  const topicDeviceId = deviceIdFromTopic(topic);
  const deviceId =
    readString(raw.deviceId) ??
    readString(raw["device.id"]) ??
    topicDeviceId;
  if (!deviceId) return null;

  const stepDeg =
    readNumber(raw.stepDeg) != null && readNumber(raw.stepDeg)! > 0
      ? Math.round(readNumber(raw.stepDeg)!)
      : 1;

  const bootMs = readNumber(raw.bootMs);
  const timestamp = readNumber(raw.timestamp);

  const deviceSeq =
    bootMs != null
      ? Math.trunc(bootMs)
      : timestamp != null
        ? Math.trunc(timestamp)
        : null;

  const capturedAt =
    readIsoTime(raw.capturedAt) ??
    readIsoTime(raw["server.timestamp"]) ??
    new Date().toISOString();

  const areaM2 =
    readNumber(raw.areaM2) ??
    readNumber(raw.scanned_area_m2) ??
    (readNumber(raw.scanned_area_cm2) != null
      ? readNumber(raw.scanned_area_cm2)! / 10_000
      : null);

  const points = parseDistances(raw.distances, stepDeg);

  if (points.length === 0 && areaM2 == null) return null;

  return {
    deviceId,
    deviceSeq,
    capturedAt,
    areaM2,
    stepDeg,
    points,
  };
}
