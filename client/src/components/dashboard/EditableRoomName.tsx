import { useEffect, useState, type MouseEvent } from "react";

interface EditableRoomNameProps {
  roomId: string;
  name: string;
  onRename: (roomId: string, name: string) => Promise<void>;
}

export function EditableRoomName({
  roomId,
  name,
  onRename,
}: EditableRoomNameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(name);
  }, [name]);

  async function commit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) {
      setDraft(name);
      setEditing(false);
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onRename(roomId, trimmed);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <input
          autoFocus
          type="text"
          value={draft}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void commit();
            if (e.key === "Escape") {
              setDraft(name);
              setEditing(false);
              setError(null);
            }
          }}
          className="w-full min-w-[8rem] rounded border border-brand-500 px-2 py-1 text-sm font-medium text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <span
      title="Double-click to rename"
      onDoubleClick={(e: MouseEvent) => {
        e.preventDefault();
        setEditing(true);
        setError(null);
      }}
      className="cursor-text font-medium text-ink-900"
    >
      {name}
    </span>
  );
}
