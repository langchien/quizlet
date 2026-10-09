import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  getHeatmapData,
  getWeeklySummary,
  getDailyStats,
  getSrsDistribution,
  getTopSets,
  getStudySessionsHistory,
} from "@/lib/dal/stats"
import { StatsClient } from "./stats-client"
import type { SessionsHistoryResponse } from "@/schemas/stats"

export default async function StatisticsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Nạp toàn bộ dữ liệu thống kê ban đầu trực tiếp từ Data Access Layer
  const [
    heatmapData,
    weeklySummary,
    dailyStats,
    srsDistribution,
    topSets,
    sessionsData,
  ] = await Promise.all([
    getHeatmapData(user.id),
    getWeeklySummary(user.id),
    getDailyStats(user.id),
    getSrsDistribution(user.id),
    getTopSets(user.id),
    getStudySessionsHistory(user.id, { page: 1, limit: 10 }),
  ])

  return (
    <StatsClient
      initialHeatmapData={heatmapData}
      initialWeeklySummary={weeklySummary}
      initialDailyStats={dailyStats}
      initialSrsDistribution={srsDistribution}
      initialTopSets={topSets}
      initialSessionsData={sessionsData as unknown as SessionsHistoryResponse}
    />
  )
}
