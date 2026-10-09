import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getTodayDateString } from "@/lib/srs"
import type { StudyMode, Prisma } from "@/generated/prisma/client"

/**
 * Lấy dữ liệu tổng quan thống kê cho Dashboard (Cached per request)
 */
export const getDashboardStats = cache(async (userId: string) => {
  const todayStr = getTodayDateString()
  const now = new Date()
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const [
    dailyToday,
    userGoal,
    dueCardsCount,
    totalSetsCount,
    totalCardsCount,
    masteredCardsCount,
    recentSessions,
  ] = await Promise.all([
    prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr,
        },
      },
    }),
    prisma.userGoal.findUnique({
      where: { userId },
    }),
    prisma.sRSData.count({
      where: {
        userId,
        nextReviewDate: { lte: endOfToday },
      },
    }),
    prisma.studySet.count({
      where: { userId },
    }),
    prisma.card.count({
      where: { studySet: { userId } },
    }),
    prisma.sRSData.count({
      where: {
        userId,
        status: "Mastered",
      },
    }),
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: {
        studySet: {
          select: { id: true, name: true },
        },
      },
    }),
  ])

  const cardTarget = userGoal?.dailyCardTarget ?? 20
  const timeTargetMinutes = userGoal?.dailyTimeTarget ?? 15
  const cardsStudiedToday = dailyToday?.cardsStudied ?? 0
  const cardsCorrectToday = dailyToday?.cardsCorrect ?? 0
  const cardsIncorrectToday = dailyToday?.cardsIncorrect ?? 0
  const timeSpentTodaySeconds = dailyToday?.timeSpent ?? 0
  const timeSpentTodayMinutes = Math.round(timeSpentTodaySeconds / 60)

  const accuracyToday =
    cardsStudiedToday > 0
      ? Math.round((cardsCorrectToday / cardsStudiedToday) * 100)
      : 0

  // Dữ liệu biểu đồ 7 ngày gần nhất
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  const past7DaysDates: { dateStr: string; dayName: string }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const dateStr = `${year}-${month}-${day}`
    const dayName = dayNames[d.getDay()]
    past7DaysDates.push({ dateStr, dayName })
  }

  const past7DaysStats = await prisma.dailyStats.findMany({
    where: {
      userId,
      date: {
        gte: past7DaysDates[0].dateStr,
        lte: past7DaysDates[past7DaysDates.length - 1].dateStr,
      },
    },
  })

  const statsMap = new Map(past7DaysStats.map((s) => [s.date, s]))

  const weeklyChart = past7DaysDates.map(({ dateStr, dayName }) => {
    const stat = statsMap.get(dateStr)
    const studied = stat?.cardsStudied ?? 0
    const correct = stat?.cardsCorrect ?? 0
    const time = stat?.timeSpent ?? 0
    const acc = studied > 0 ? Math.round((correct / studied) * 100) : 0
    return {
      date: dateStr,
      dayName,
      cardsStudied: studied,
      cardsCorrect: correct,
      timeSpent: Math.round(time / 60),
      accuracy: acc,
    }
  })

  // Thống kê độ chính xác theo chế độ học
  const allSessions = await prisma.studySession.findMany({
    where: { userId },
    select: {
      mode: true,
      totalCards: true,
      correctCards: true,
      duration: true,
    },
  })

  const modeMap: Record<
    string,
    { sessions: number; cards: number; correct: number; duration: number }
  > = {}

  for (const s of allSessions) {
    if (!modeMap[s.mode]) {
      modeMap[s.mode] = { sessions: 0, cards: 0, correct: 0, duration: 0 }
    }
    modeMap[s.mode].sessions += 1
    modeMap[s.mode].cards += s.totalCards
    modeMap[s.mode].correct += s.correctCards
    modeMap[s.mode].duration += s.duration
  }

  const modeAccuracies = Object.entries(modeMap).map(([mode, data]) => ({
    mode,
    totalSessions: data.sessions,
    totalCards: data.cards,
    correctCards: data.correct,
    accuracy:
      data.cards > 0 ? Math.round((data.correct / data.cards) * 100) : 0,
    totalDuration: data.duration,
  }))

  return {
    cardsStudiedToday,
    cardsCorrectToday,
    cardsIncorrectToday,
    timeSpentTodaySeconds,
    accuracyToday,
    currentStreak: userGoal?.currentStreak ?? (cardsStudiedToday > 0 ? 1 : 0),
    longestStreak: userGoal?.longestStreak ?? (cardsStudiedToday > 0 ? 1 : 0),
    dailyGoal: {
      cardTarget,
      timeTargetMinutes,
      cardProgress: Math.min(
        100,
        Math.round((cardsStudiedToday / cardTarget) * 100)
      ),
      timeProgressMinutes: Math.min(
        100,
        Math.round((timeSpentTodayMinutes / timeTargetMinutes) * 100)
      ),
      isCardTargetMet: cardsStudiedToday >= cardTarget,
      isTimeTargetMet: timeSpentTodayMinutes >= timeTargetMinutes,
    },
    dueCardsCount,
    totalSetsCount,
    totalCardsCount,
    masteredCardsCount,
    recentSessions,
    weeklyChart,
    modeAccuracies,
  }
})

/**
 * Lấy dữ liệu Heatmap ôn tập (Cached per request)
 */
export const getHeatmapData = cache(
  async (userId: string, yearParam?: string) => {
    let startDate: Date
    let endDate: Date

    if (yearParam && !isNaN(parseInt(yearParam, 10))) {
      const year = parseInt(yearParam, 10)
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
    } else {
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 364)
    }

    const startStr = startDate.toISOString().split("T")[0]
    const endStr = endDate.toISOString().split("T")[0]

    const stats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: {
          gte: startStr,
          lte: endStr,
        },
      },
    })

    const statsMap = new Map(stats.map((s) => [s.date, s]))
    const result = []
    const cur = new Date(startDate)

    while (cur <= endDate) {
      const year = cur.getFullYear()
      const month = String(cur.getMonth() + 1).padStart(2, "0")
      const day = String(cur.getDate()).padStart(2, "0")
      const dateStr = `${year}-${month}-${day}`

      const stat = statsMap.get(dateStr)
      const count = stat?.cardsStudied ?? 0
      const timeSpent = stat?.timeSpent ?? 0

      let level = 0
      if (count > 0 && count <= 10) level = 1
      else if (count > 10 && count <= 25) level = 2
      else if (count > 25 && count <= 50) level = 3
      else if (count > 50) level = 4

      result.push({
        date: dateStr,
        count,
        level,
        timeSpent: Math.round(timeSpent / 60),
      })

      cur.setDate(cur.getDate() + 1)
    }

    return result
  }
)

/**
 * Lấy báo cáo so sánh tuần này vs tuần trước (Cached per request)
 */
export const getWeeklySummary = cache(async (userId: string) => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(thisWeekStart.getDate() - 6)
  thisWeekStart.setHours(0, 0, 0, 0)

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
        userId,
        date: { gte: thisWeekStartStr, lte: todayStr },
      },
    }),
    prisma.dailyStats.findMany({
      where: {
        userId,
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
      cardsCorrect,
      timeSpentSeconds,
      accuracy,
      studyDays,
    }
  }

  const thisWeek = calculateMetrics(thisWeekStats)
  const lastWeek = calculateMetrics(lastWeekStats)

  const calcDiff = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  return {
    thisWeek,
    lastWeek,
    growth: {
      cardsStudiedPercent: calcDiff(
        thisWeek.cardsStudied,
        lastWeek.cardsStudied
      ),
      timeSpentPercent: calcDiff(
        thisWeek.timeSpentSeconds,
        lastWeek.timeSpentSeconds
      ),
      accuracyDiff: thisWeek.accuracy - lastWeek.accuracy,
    },
  }
})

/**
 * Lấy thống kê theo từng ngày (Cached per request)
 */
export const getDailyStats = cache(
  async (userId: string, fromDate?: string, toDate?: string) => {
    const now = new Date()
    const defaultTo = now.toISOString().split("T")[0]
    const past30 = new Date(now)
    past30.setDate(past30.getDate() - 29)
    const defaultFrom = past30.toISOString().split("T")[0]

    const from = fromDate || defaultFrom
    const to = toDate || defaultTo

    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { date: "asc" },
    })

    return dailyStats.map((stat) => ({
      id: stat.id,
      userId: stat.userId,
      date: stat.date,
      cardsStudied: stat.cardsStudied,
      cardsCorrect: stat.cardsCorrect,
      cardsIncorrect: stat.cardsIncorrect,
      timeSpent: stat.timeSpent,
      newCardsSeen: stat.newCardsSeen,
      reviewCards: stat.reviewCards,
      streak: stat.streak,
      accuracy:
        stat.cardsStudied > 0
          ? Math.round((stat.cardsCorrect / stat.cardsStudied) * 100)
          : 0,
    }))
  }
)

/**
 * Lấy phân bố trạng thái SRS (Cached per request)
 */
export const getSrsDistribution = cache(async (userId: string) => {
  const counts = await prisma.sRSData.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  })

  const distMap: Record<string, number> = {
    New: 0,
    Learning: 0,
    Review: 0,
    Mastered: 0,
  }

  for (const c of counts) {
    distMap[c.status] = c._count._all
  }

  return [
    { name: "Mới tạo", value: distMap.New, color: "#3B82F6" },
    { name: "Đang học", value: distMap.Learning, color: "#F59E0B" },
    { name: "Ôn tập", value: distMap.Review, color: "#8B5CF6" },
    { name: "Thuần thục", value: distMap.Mastered, color: "#10B981" },
  ]
})

/**
 * Lấy top bộ thẻ có số lượng thẻ nhiều nhất (Cached per request)
 */
export const getTopSets = cache(async (userId: string, limit = 5) => {
  const sets = await prisma.studySet.findMany({
    where: { userId },
    select: {
      name: true,
      _count: {
        select: { cards: true },
      },
    },
    orderBy: {
      cards: {
        _count: "desc",
      },
    },
    take: limit,
  })

  return sets.map((s) => ({
    name: s.name,
    count: s._count.cards,
  }))
})

/**
 * Lấy lịch sử phiên học có phân trang và lọc theo chế độ học
 */
export const getStudySessionsHistory = cache(
  async (
    userId: string,
    options: {
      page?: number
      limit?: number
      mode?: string
      setId?: string
    } = {}
  ) => {
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(100, Math.max(1, options.limit || 10))
    const mode =
      options.mode && options.mode !== "all"
        ? (options.mode as StudyMode)
        : undefined
    const setId = options.setId

    const where: Prisma.StudySessionWhereInput = {
      userId,
      ...(mode ? { mode } : {}),
      ...(setId ? { studySetId: setId } : {}),
    }

    const [total, sessions] = await Promise.all([
      prisma.studySession.count({ where }),
      prisma.studySession.findMany({
        where,
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          studySet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }
)
