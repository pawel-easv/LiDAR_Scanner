import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDbHealth, type DbHealth } from "@/lib/api";

export type FetchState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: Error }
  | { status: "empty"; data: null; error: null }
  | { status: "success"; data: T; error: null };

interface Options {
  enabled?: boolean;
  pollMs?: number;
}

export function useDbHealth({ enabled = true, pollMs }: Options = {}) {
  const [state, setState] = useState<FetchState<DbHealth>>({
    status: "loading",
    data: null,
    error: null,
  });

  const requestIdRef = useRef(0);

  const run = useCallback((signal: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    setState({ status: "loading", data: null, error: null });

    fetchDbHealth(signal)
      .then((data) => {
        if (signal.aborted || requestId !== requestIdRef.current) return;
        if (!data) {
          setState({ status: "empty", data: null, error: null });
          return;
        }
        setState({ status: "success", data, error: null });
      })
      .catch((err: unknown) => {
        if (signal.aborted || requestId !== requestIdRef.current) return;
        const error = err instanceof Error ? err : new Error(String(err));
        if (error.name === "AbortError") return;
        setState({ status: "error", data: null, error });
      });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    run(controller.signal);

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (pollMs && pollMs > 0) {
      intervalId = setInterval(() => run(controller.signal), pollMs);
    }

    return () => {
      controller.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, pollMs, run]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    run(controller.signal);
    return () => controller.abort();
  }, [run]);

  return { ...state, refetch };
}
