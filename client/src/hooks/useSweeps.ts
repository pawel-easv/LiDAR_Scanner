import { useCallback } from "react";
import { fetchLatestSweep, fetchSweeps } from "@/lib/api";
import type { SweepDetail, SweepSummary } from "@/types";
import { useFetch } from "@/hooks/useFetch";

export function useSweepHistory(pollMs?: number) {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchSweeps(signal),
    [],
  );
  const isEmpty = useCallback((data: SweepSummary[]) => data.length === 0, []);

  return useFetch(fetcher, isEmpty, { pollMs });
}

export function useLatestSweep(pollMs?: number) {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchLatestSweep(signal),
    [],
  );
  const isEmpty = useCallback((data: SweepDetail | null) => data === null, []);

  return useFetch(fetcher, isEmpty, { pollMs });
}
