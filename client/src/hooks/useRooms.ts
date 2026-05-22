import { useCallback } from "react";
import { fetchRoomDetail, fetchRooms } from "@/lib/api";
import type { RoomSummary } from "@/types";
import { useFetch } from "@/hooks/useFetch";

export function useRooms(pollMs?: number) {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchRooms(signal),
    [],
  );
  const isEmpty = useCallback((data: RoomSummary[]) => data.length === 0, []);

  return useFetch(fetcher, isEmpty, { pollMs });
}

export function useRoomDetail(roomId: string | null) {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchRoomDetail(roomId!, signal),
    [roomId],
  );
  const isEmpty = useCallback(() => false, []);

  return useFetch(fetcher, isEmpty, { enabled: roomId != null });
}
