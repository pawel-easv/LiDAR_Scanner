import mqtt, { type MqttClient } from "mqtt";
import { env } from "../../config/env.ts";
import { parseFlespiSweepMessage } from "../../parsers/flespiSweepParser.ts";
import { saveSweep } from "../../repositories/sweepWriteRepository.ts";

let client: MqttClient | null = null;

function commandTopic(deviceId: string): string {
  return `lidar/${deviceId}/command`;
}

function flespiCommandTopic(deviceId: string): string {
  return `flespi/command/gw/devices/${deviceId}`;
}

export function startFlespiMqttBridge(): MqttClient {
  if (client) return client;

  client = mqtt.connect(env.mqttUrl, {
    username: env.flespiToken,
    password: "",
    clientId: `lidar-bridge-${process.env.HOSTNAME ?? "local"}`,
    clean: false,
    reconnectPeriod: 2000,
    keepalive: 30,
  });

  client.on("connect", () => {
    console.log(`[mqtt] connected to ${env.mqttUrl}`);
    for (const topic of env.mqttSubscribeTopics) {
      client!.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`[mqtt] subscribe failed (${topic}):`, err.message);
          return;
        }
        console.log(`[mqtt] subscribed to ${topic}`);
      });
    }
  });

  client.on("reconnect", () => console.log("[mqtt] reconnecting..."));
  client.on("error", (err) => console.error("[mqtt] error:", err.message));
  client.on("close", () => console.log("[mqtt] connection closed"));

  client.on("message", (topic, payload) => {
    const sweep = parseFlespiSweepMessage(topic, payload);
    if (!sweep) {
      const preview = payload.toString("utf8").slice(0, 240);
      console.warn(
        `[mqtt] dropped payload on ${topic} (${payload.length} bytes): ${preview}`,
      );
      return;
    }

    saveSweep(sweep)
      .then(({ id, inserted }) =>
        console.log(
          `[mqtt] ${inserted ? "stored" : "updated"} sweep ${id} device=${sweep.deviceId} points=${sweep.points.length} area=${sweep.areaM2 ?? "n/a"} m²`,
        ),
      )
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[mqtt] DB write failed for ${topic}:`, message);
      });
  });

  return client;
}

/** Publish a JSON command to the device via MQTT (custom + Flespi topics). */
export function publishDeviceCommand(
  deviceId: string,
  command: Record<string, unknown>,
): Promise<void> {
  const active = client;
  if (!active?.connected) {
    return Promise.reject(new Error("MQTT client is not connected"));
  }

  const body = JSON.stringify(command);
  const topics = [commandTopic(deviceId), flespiCommandTopic(deviceId)];

  return new Promise((resolve, reject) => {
    let pending = topics.length;
    let failed: Error | null = null;

    for (const topic of topics) {
      active.publish(topic, body, { qos: 1 }, (err) => {
        if (err && !failed) failed = err;
        pending -= 1;
        if (pending === 0) {
          if (failed) reject(failed);
          else {
            console.log(`[mqtt] published command to ${deviceId}`);
            resolve();
          }
        }
      });
    }
  });
}

export function stopFlespiMqttBridge(): void {
  if (!client) return;
  client.end(true);
  client = null;
}

export function getMqttClient(): MqttClient | null {
  return client;
}
