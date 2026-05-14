import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { PeriodTabs } from "@/components/dashboard/PeriodTabs";
import { StatCard } from "@/components/dashboard/StatCard";
import { RoomActivitiesChart } from "@/components/dashboard/RoomActivitiesChart";
import { HistoryOfRooms } from "@/components/dashboard/HistoryOfRooms";
import { chartData, roomHistory, stats } from "@/data/mockData";
import type { Period } from "@/types";

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("Week");

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-6 flex flex-col gap-5">
        <Topbar title="Dashboard" userName="Polish Power" />

        <PeriodTabs
          value={period}
          onChange={setPeriod}
          dateRange="20 - 30 May 2025"
        />

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5">
          <RoomActivitiesChart data={chartData} />
        </section>

        <section className="grid grid-cols-1 gap-5">
          <HistoryOfRooms entries={roomHistory} />
        </section>
      </div>
    </div>
  );
}
