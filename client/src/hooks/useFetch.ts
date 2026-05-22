import { useCallback, useEffect, useRef, useState } from "react";

export type FetchState<T> =
  | { status: "loading"; data: null; error: null; refreshing: false }
  | { status: "error"; data: null; error: Error; refreshing: false }
  | { status: "empty"; data: null; error: null; refreshing: false }
  | { status: "success"; data: T; error: null; refreshing: boolean };

interface Options {
  enabled?: boolean;
  /** Background refresh interval. Does not clear the UI between polls. */
  pollMs?: number;
}

export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  isEmpty: (data: T) => boolean,
  { enabled = true, pollMs }: Options = {},
) {
  const [state, setState] = useState<FetchState<T>>({
    status: "loading",
    data: null,
    error: null,
    refreshing: false,
  });

  const requestIdRef = useRef(0);
  const hasDataRef = useRef(false);

  const run = useCallback(
    (signal: AbortSignal, { background = false }: { background?: boolean } = {}) => {
      const requestId = ++requestIdRef.current;

      if (!background || !hasDataRef.current) {
        setState({ status: "loading", data: null, error: null, refreshing: false });
      } else {
        setState((prev) =>
          prev.status === "success"
            ? { ...prev, refreshing: true }
            : prev,
        );
      }

      fetcher(signal)
        .then((data) => {
          if (signal.aborted || requestId !== requestIdRef.current) return;
          if (isEmpty(data)) {
            hasDataRef.current = false;
            setState({ status: "empty", data: null, error: null, refreshing: false });
            return;
          }
          hasDataRef.current = true;
          setState({ status: "success", data, error: null, refreshing: false });
        })
        .catch((err: unknown) => {
          if (signal.aborted || requestId !== requestIdRef.current) return;
          const error = err instanceof Error ? err : new Error(String(err));
          if (error.name === "AbortError") return;

          setState((prev) => {
            if (background && prev.status === "success") {
              return { ...prev, refreshing: false };
            }
            hasDataRef.current = false;
            return { status: "error", data: null, error, refreshing: false };
          });
        });
    },
    [fetcher, isEmpty],
  );

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    run(controller.signal);

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (pollMs && pollMs > 0) {
      intervalId = setInterval(
        () => run(controller.signal, { background: true }),
        pollMs,
      );
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
