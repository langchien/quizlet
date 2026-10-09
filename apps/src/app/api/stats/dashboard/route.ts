import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { getTodayDateString } from "@/lib/srs"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập dữ liệu thống kê." },
        { status: 401 }
      )
    }

    const todayStr = getTodayDateString()
    const now = new Date()
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    // 1. Lấy thông tin thống kê hôm nay và mục tiêu người dùng
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
            userId: user.id,
            date: todayStr,
          },
        },
      }),
      prisma.userGoal.findUnique({
        where: { userId: user.id },
      }),
      prisma.sRSData.count({
        where: {
          userId: user.id,
          nextReviewDate: { lte: endOfToday },
        },
      }),
      prisma.studySet.count({
        where: { userId: user.id },
      }),
      prisma.card.count({
        where: { studySet: { userId: user.id } },
      }),
      prisma.sRSData.count({
        where: {
          userId: user.id,
          status: "Mastered",
        },
      }),
      prisma.studySession.findMany({
        where: { userId: user.id },
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

    // 2. Dữ liệu biểu đồ 7 ngày gần nhất
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
        userId: user.id,
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
        timeSpent: Math.round(time / 60), // Số phút
        accuracy: acc,
      }
    })

    // 3. Độ chính xác theo từng chế độ học (StudyMode)
    const allSessions = await prisma.studySession.findMany({
      where: { userId: user.id },
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

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/stats/dashboard:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy dữ liệu tổng quan." },
      { status: 500 }
    )
  }
}
