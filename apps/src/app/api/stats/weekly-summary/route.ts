import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem báo cáo tuần." },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Tuần này: 7 ngày qua (Day 0 đến Day -6)
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(thisWeekStart.getDate() - 6)
    thisWeekStart.setHours(0, 0, 0, 0)

    // Tuần trước: 7 ngày trước đó (Day -7 đến Day -13)
    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)
    lastWeekEnd.setHours(23, 59, 59, 999)

    const lastWeekStart = new Date(lastWeekEnd)
    lastWeekStart.setDate(lastWeekStart.getDate() - 6)
    lastWeekStart.setHours(0, 0, 0, 0)

    const thisWeekStartStr = thisWeekStart.toISOString().split("T")[0]
    const todayStr = today.toISOString().split("T")[0]
    const lastWeekStartStr = lastWeekStart.toISOString().split("T")[0]
    const lastWeekEndStr = lastWeekEnd.toISOString().split("T")[0]

    const [thisWeekStats, lastWeekStats] = await Promise.all([
      prisma.dailyStats.findMany({
        where: {
          userId: user.id,
          date: { gte: thisWeekStartStr, lte: todayStr },
        },
      }),
      prisma.dailyStats.findMany({
        where: {
          userId: user.id,
          date: { gte: lastWeekStartStr, lte: lastWeekEndStr },
        },
      }),
    ])

    const calculateMetrics = (stats: typeof thisWeekStats) => {
      let cardsStudied = 0
      let cardsCorrect = 0
      let timeSpentSeconds = 0
      let studyDays = 0

      for (const s of stats) {
        cardsStudied += s.cardsStudied
        cardsCorrect += s.cardsCorrect
        timeSpentSeconds += s.timeSpent
        if (s.cardsStudied > 0 || s.timeSpent > 0) {
          studyDays += 1
        }
      }

      const accuracy =
        cardsStudied > 0 ? Math.round((cardsCorrect / cardsStudied) * 100) : 0

      return {
        cardsStudied,
        timeSpentSeconds,
        accuracy,
        studyDays,
      }
    }

    const thisWeek = calculateMetrics(thisWeekStats)
    const lastWeek = calculateMetrics(lastWeekStats)

    // Tính % tăng trưởng
    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }

    const growth = {
      cardsStudiedPercent: calcGrowth(
        thisWeek.cardsStudied,
        lastWeek.cardsStudied
      ),
      timeSpentPercent: calcGrowth(
        thisWeek.timeSpentSeconds,
        lastWeek.timeSpentSeconds
      ),
      accuracyDiff: thisWeek.accuracy - lastWeek.accuracy,
    }

    return NextResponse.json({
      thisWeek,
      lastWeek,
      growth,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/stats/weekly-summary:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi tổng hợp báo cáo tuần." },
      { status: 500 }
    )
  }
}
