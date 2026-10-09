import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getCalendarDue, getCalendarToday } from "@/lib/dal/calendar"
import { CalendarClient } from "./calendar-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lịch ôn tập Spaced Repetition | NihoMemo",
  description:
    "Lịch theo dõi và dự báo các mốc thời gian ôn tập từ vựng tiếng Nhật theo thuật toán lặp lại ngắt quãng.",
}

export default async function CalendarPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const [monthData, todayData] = await Promise.all([
    getCalendarDue(user.id),
    getCalendarToday(user.id),
  ])

  return (
    <CalendarClient initialMonthData={monthData} initialTodayData={todayData} />
  )
}
