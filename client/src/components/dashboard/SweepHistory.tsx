import { useCallback, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EditableRoomName } from "@/components/dashboard/EditableRoomName";
import { RoomSweepDetail } from "@/components/dashboard/RoomSweepDetail";
import { formatAreaM2, formatDateTime } from "@/lib/format";
import { renameRoom } from "@/lib/api";
import { resolveRoomDisplay } from "@/lib/roomNames";
import { useRoomDetail } from "@/hooks/useRooms";
import type { SweepSummary } from "@/types";

interface SweepHistoryProps {
  entries: SweepSummary[];
  onRoomsChange: () => void;
  onSweepsChange: () => void;
}

export function SweepHistory({
  entries,
  onRoomsChange,
  onSweepsChange,
}: SweepHistoryProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState("");

  const roomDetail = useRoomDetail(selectedRoomId);

  const handleRename = useCallback(
    async (roomId: string, name: string) => {
      await renameRoom(roomId, name);
      onRoomsChange();
      onSweepsChange();
      if (selectedRoomId === roomId) {
        setSelectedRoomName(name);
      }
    },
    [onRoomsChange, onSweepsChange, selectedRoomId],
  );

  const openRoom = useCallback((roomId: string, roomName: string) => {
    setSelectedRoomId(roomId);
    setSelectedRoomName(roomName);
  }, []);

  if (selectedRoomId) {
    return (
      <RoomSweepDetail
        roomId={selectedRoomId}
        roomName={selectedRoomName}
        state={roomDetail}
        onRetry={roomDetail.refetch}
        onRename={handleRename}
        onBack={() => {
          setSelectedRoomId(null);
          setSelectedRoomName("");
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader title="Sweep history" />

      {entries.length === 0 ? (
        <div className="py-10 text-center text-sm text-ink-500">
          No data yet. History will appear here once the ESP32 starts reporting.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-500">
                <th className="font-medium pb-3 pr-4">Name</th>
                <th className="font-medium pb-3 pr-4">Captured</th>
                <th className="font-medium pb-3 pr-4">Device</th>
                <th className="font-medium pb-3 pr-4">Area (m²)</th>
                <th className="font-medium pb-3 pr-8">Points</th>
                <th className="font-medium pb-3 pl-4 w-28" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const { roomId, name } = resolveRoomDisplay(entry);
                return (
                  <tr
                    key={entry.id}
                    className="border-t border-ink-100 text-ink-900"
                  >
                    <td className="py-3 pr-4">
                      <EditableRoomName
                        roomId={roomId}
                        name={name}
                        onRename={handleRename}
                      />
                    </td>
                    <td className="py-3 pr-4 text-ink-500">
                      {formatDateTime(entry.capturedAt)}
                    </td>
                    <td className="py-3 pr-4 font-medium">{entry.deviceId}</td>
                    <td className="py-3 pr-4 font-medium">
                      {formatAreaM2(entry.areaM2)}
                    </td>
                    <td className="py-3 pr-8 text-ink-500 tabular-nums">
                      {entry.pointCount}
                    </td>
                    <td className="py-3 pl-4">
                      <button
                        type="button"
                        onClick={() => openRoom(roomId, name)}
                        className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
