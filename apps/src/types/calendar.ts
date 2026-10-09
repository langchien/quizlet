import type { getCalendarDue, getCalendarToday } from "@/lib/dal/calendar"

export type MonthDueData = Awaited<ReturnType<typeof getCalendarDue>>
export type TodayDueData = Awaited<ReturnType<typeof getCalendarToday>>

export interface CalendarCell {
  dateStr: string
  dayNum: number
  isCurrentMonth: boolean
  isToday: boolean
  dueCount: number
}

export const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
] as const

export const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const

export const SRS_STATUS_BADGES: Record<
  string,
  { label: string; className: string }
> = {
  New: {
    label: "Mới",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  Learning: {
    label: "Đang học",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Review: {
    label: "Ôn tập",
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  Mastered: {
    label: "Thuần thục",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
}
