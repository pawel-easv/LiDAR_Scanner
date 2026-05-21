import { startFlespiMqttBridge, stopFlespiMqttBridge } from "./adapters/flespi/mqttBridge.ts";
import { logFlespiDeviceSetup } from "./adapters/flespi/verifyFlespi.ts";
import { createApp } from "./app.ts";
import { env } from "./config/env.ts";

const app = createApp();

void logFlespiDeviceSetup();
startFlespiMqttBridge();

const server = app.listen(env.apiPort, env.apiHost, () => {
  console.log(`API listening on http://${env.apiHost}:${env.apiPort}`);
});

function shutdown() {
  console.log("[server] shutting down...");
  stopFlespiMqttBridge();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
