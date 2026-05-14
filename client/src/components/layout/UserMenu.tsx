import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Database,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  CircleOff,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/components/ui/cn";
import { useDbHealth } from "@/hooks/useDbHealth";

interface UserMenuProps {
  userName: string;
  userAvatar?: string;
}

export function UserMenu({ userName, userAvatar }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const health = useDbHealth({ enabled: open, pollMs: open ? 15_000 : undefined });

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 h-11 pl-1 pr-3 rounded-full bg-white border border-ink-200 hover:bg-ink-100 transition"
      >
        <Avatar name={userName} src={userAvatar} size={36} />
        <span className="text-sm font-semibold text-ink-900">{userName}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-xl border border-ink-200 bg-white shadow-card overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-ink-100">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Signed in as
            </p>
            <p className="text-sm font-semibold text-ink-900">{userName}</p>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2 text-ink-500">
              <Database className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Database
              </span>
            </div>
            <DbHealthRow
              state={health}
              onRetry={() => {
                health.refetch();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface DbHealthRowProps {
  state: ReturnType<typeof useDbHealth>;
  onRetry: () => void;
}

function DbHealthRow({ state, onRetry }: DbHealthRowProps) {
  if (state.status === "loading") {
    return (
      <Row icon={<Loader2 className="h-4 w-4 animate-spin text-ink-400" />}>
        <span className="text-sm text-ink-500">Checking…</span>
      </Row>
    );
  }

  if (state.status === "error") {
    return (
      <Row icon={<AlertCircle className="h-4 w-4 text-red-500" />}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-600">Not connected</p>
          <p className="text-xs text-ink-500 truncate" title={state.error.message}>
            {state.error.message}
          </p>
        </div>
        <RetryButton onClick={onRetry} />
      </Row>
    );
  }

  if (state.status === "empty") {
    return (
      <Row icon={<CircleOff className="h-4 w-4 text-ink-400" />}>
        <span className="text-sm text-ink-500">No status available</span>
        <RetryButton onClick={onRetry} />
      </Row>
    );
  }

  const ok = state.data.status === "ok";
  return (
    <Row
      icon={
        ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )
      }
    >
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold",
            ok ? "text-emerald-600" : "text-red-600",
          )}
        >
          {ok ? "Database: OK" : "Not connected"}
        </p>
        <p className="text-xs text-ink-500">
          {state.data.database} · {state.data.latencyMs}ms
        </p>
      </div>
      <RetryButton onClick={onRetry} />
    </Row>
  );
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      {children}
    </div>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Recheck database"
      className="ml-auto p-1 rounded-md text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition"
    >
      <RefreshCw className="h-3.5 w-3.5" />
    </button>
  );
}
