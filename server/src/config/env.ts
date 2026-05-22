function readRequired(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `${name} is not set. Add it to .env at the repo root (see .env.example).`,
    );
  }
  return value;
}

function readOptionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number, got "${raw}".`);
  }
  return parsed;
}

function readMqttSubscribeTopics(): string[] {
  const fromEnv = process.env.MQTT_TOPICS ?? process.env.MQTT_TOPIC ?? "";
  const custom = fromEnv
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const topics = ["flespi/message/gw/devices/+"];
  const deviceId = process.env.FLESPI_DEVICE_ID?.trim();
  if (deviceId) {
    topics.push(`flespi/message/gw/devices/${deviceId}`);
  }

  return [...new Set([...custom, ...topics])];
}

export const env = {
  databaseUrl: readRequired("DATABASE_URL"),
  databaseLabel: process.env.DATABASE_LABEL ?? "database",
  apiHost: process.env.API_HOST ?? "127.0.0.1",
  apiPort: readOptionalNumber("API_PORT", 5174),
  mqttUrl: readRequired("MQTT_URL"),
  flespiToken: readRequired("FLESPI_TOKEN"),
  mqttSubscribeTopics: readMqttSubscribeTopics(),
} as const;
