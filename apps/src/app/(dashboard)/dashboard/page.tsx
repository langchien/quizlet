import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getDashboardStats } from "@/lib/dal/stats"
import { getSets } from "@/lib/dal/sets"
import { DashboardClient } from "./dashboard-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tổng quan học tập | NihoMemo",
  description:
    "Bảng điều khiển và theo dõi tiến độ học tiếng Nhật với Spaced Repetition.",
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const [stats, setsData] = await Promise.all([
    getDashboardStats(user.id),
    getSets({ userId: user.id, limit: 6 }),
  ])

  return (
    <DashboardClient
      initialStats={stats}
      recentSets={setsData.items}
      userName={user.name}
    />
  )
}
