import type { ChartBar, RoomHistoryEntry, Stat } from "@/types";

export const stats: Stat[] = [
  {
    id: "total",
    label: "Total Rooms",
    value: 585,
    unit: "Room",
    trend: "up",
    delta: "+20%",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-600",
  },
  {
    id: "available",
    label: "Rooms Available",
    value: 391,
    unit: "Room",
    trend: "up",
    delta: "+16%",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-600",
  },
  {
    id: "filled",
    label: "Room Filled",
    value: 184,
    unit: "Room",
    trend: "up",
    delta: "+14%",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-600",
  },
  {
    id: "repair",
    label: "Room under repair",
    value: 10,
    unit: "Room",
    trend: "down",
    delta: "-4%",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-600",
  },
];

export const chartData: ChartBar[] = [
  { day: "Mon", value: 28 },
  { day: "Tue", value: 18 },
  { day: "Wed", value: 48 },
  { day: "Thu", value: 30 },
  { day: "Fri", value: 78, highlighted: true },
  { day: "Sat", value: 40 },
  { day: "Sun", value: 52 },
];

export const roomHistory: RoomHistoryEntry[] = [];
