import { env } from "../../config/env.ts";

interface FlespiDevice {
  id: number;
  name: string;
  configuration?: { ident?: string };
}

export async function logFlespiDeviceSetup(): Promise<void> {
  try {
    const res = await fetch("https://flespi.io/gw/devices/all", {
      headers: { Authorization: `FlespiToken ${env.flespiToken}` },
    });
    const body = (await res.json()) as { result?: FlespiDevice[] };
    const devices = body.result ?? [];

    if (devices.length === 0) {
      console.warn(
        "[flespi] WARNING: This token has no devices. ESP HTTP posts will not be visible on MQTT.",
      );
      return;
    }

    const summary = devices
      .map((d) => `${d.name} (id=${d.id}, ident=${d.configuration?.ident ?? "—"})`)
      .join("; ");
    console.log(`[flespi] ${devices.length} device(s) on token: ${summary}`);

    const expected = process.env.FLESPI_DEVICE_ID?.trim();
    if (expected && !devices.some((d) => String(d.id) === expected)) {
      console.warn(
        `[flespi] WARNING: FLESPI_DEVICE_ID=${expected} not found on this token.`,
      );
    }
  } catch (err) {
    console.warn(
      "[flespi] Could not verify devices:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
