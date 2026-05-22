import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EditableRoomName } from "@/components/dashboard/EditableRoomName";
import { FetchStateBlock } from "@/components/dashboard/FetchStateBlock";
import { formatAreaM2, formatDateTime } from "@/lib/format";
import type { FetchState } from "@/hooks/useFetch";
import type { RoomDetail } from "@/types";

interface RoomSweepDetailProps {
  roomId: string;
  roomName: string;
  state: FetchState<RoomDetail>;
  onRetry: () => void;
  onRename: (roomId: string, name: string) => Promise<void>;
  onBack: () => void;
}

function SweepAnglesRow({
  capturedAt,
  areaM2,
  points,
}: {
  capturedAt: string;
  areaM2: number | null;
  points: { angleDeg: number; distanceCm: number }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr className="border-t border-ink-100 text-ink-900">
        <td className="py-3 pr-4">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-left font-medium text-brand-600 hover:text-brand-700"
          >
            {open ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            {formatDateTime(capturedAt)}
          </button>
        </td>
        <td className="py-3 pr-4 font-medium">{formatAreaM2(areaM2)}</td>
        <td className="py-3 text-ink-500">{points.length}</td>
      </tr>
      {open && (
        <tr className="border-t border-ink-50 bg-ink-50/40">
          <td colSpan={3} className="px-4 py-3">
            <div className="max-h-48 overflow-y-auto rounded-lg border border-ink-100 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-ink-500">
                    <th className="font-medium px-3 py-2">Angle (°)</th>
                    <th className="font-medium px-3 py-2">Distance (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr
                      key={p.angleDeg}
                      className="border-t border-ink-100 text-ink-900"
                    >
                      <td className="px-3 py-1.5">{p.angleDeg}</td>
                      <td className="px-3 py-1.5">{p.distanceCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function RoomSweepDetail({
  roomId,
  roomName,
  state,
  onRetry,
  onRename,
  onBack,
}: RoomSweepDetailProps) {
  return (
    <Card>
      <CardHeader
        title={
          <EditableRoomName
            roomId={roomId}
            name={roomName}
            onRename={onRename}
          />
        }
        action={
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Back to history
          </button>
        }
      />

      <FetchStateBlock
        state={state}
        onRetry={onRetry}
        loadingLabel="Loading room sweeps…"
        emptyLabel="No sweeps assigned to this room yet."
      >
        {(room) =>
          room.sweeps.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-500">
              No sweeps assigned to this room yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-500">
                    <th className="font-medium pb-3 pr-4">Captured</th>
                    <th className="font-medium pb-3 pr-4">Area (m²)</th>
                    <th className="font-medium pb-3">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {room.sweeps.map((sweep) => (
                    <SweepAnglesRow
                      key={sweep.id}
                      capturedAt={sweep.capturedAt}
                      areaM2={sweep.areaM2}
                      points={sweep.points}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </FetchStateBlock>
    </Card>
  );
}
