/** Mirrors server default sweep room name. */
export function defaultSweepRoomName(deviceId: string): string {
  return `Room · ${deviceId}`;
}

export function resolveRoomDisplay(
  entry: {
    id: string;
    roomId: string | null;
    roomName: string | null;
    deviceId: string;
  },
): { roomId: string; name: string } {
  return {
    roomId: entry.roomId ?? entry.id,
    name: entry.roomName ?? defaultSweepRoomName(entry.deviceId),
  };
}
