import { Card, CardHeader } from "@/components/ui/Card";
import type { RoomHistoryEntry } from "@/types";

interface HistoryOfRoomsProps {
  entries: RoomHistoryEntry[];
}

export function HistoryOfRooms({ entries }: HistoryOfRoomsProps) {
  return (
    <Card>
      <CardHeader title="History of Rooms" />

      {entries.length === 0 ? (
        <div className="py-10 text-center text-sm text-ink-500">
          No data yet. History will appear here once the ESP32 starts reporting.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-500">
                <th className="font-medium pb-3 pr-4">Room</th>
                <th className="font-medium pb-3 pr-4">Entered</th>
                <th className="font-medium pb-3 pr-4">Left</th>
                <th className="font-medium pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-ink-100 text-ink-900"
                >
                  <td className="py-3 pr-4 font-medium">{entry.room}</td>
                  <td className="py-3 pr-4 text-ink-500">{entry.enteredAt}</td>
                  <td className="py-3 pr-4 text-ink-500">
                    {entry.leftAt ?? "—"}
                  </td>
                  <td className="py-3 text-ink-500">{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
