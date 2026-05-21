import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { FetchState } from "@/hooks/useFetch";

interface FetchStateBlockProps<T> {
  state: FetchState<T>;
  onRetry?: () => void;
  loadingLabel?: string;
  emptyLabel?: string;
  children: (data: NonNullable<T>) => ReactNode;
}

export function FetchStateBlock<T>({
  state,
  onRetry,
  loadingLabel = "Loading…",
  emptyLabel = "No data yet.",
  children,
}: FetchStateBlockProps<T>) {
  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingLabel}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm font-medium text-red-600">
          {state.error.message}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <p className="py-16 text-center text-sm text-ink-500">{emptyLabel}</p>
    );
  }

  return <>{children(state.data as NonNullable<T>)}</>;
}
