import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { getTodayDateString } from "@/lib/srs"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem tiến độ mục tiêu." },
        { status: 401 }
      )
    }

    const todayStr = getTodayDateString()

    const [goal, dailyToday] = await Promise.all([
      prisma.userGoal.findUnique({
        where: { userId: user.id },
      }),
      prisma.dailyStats.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: todayStr,
          },
        },
      }),
    ])

    const cardTarget = goal?.dailyCardTarget ?? 20
    const timeTargetMinutes = goal?.dailyTimeTarget ?? 15

    const cardsStudiedToday = dailyToday?.cardsStudied ?? 0
    const timeSpentTodaySeconds = dailyToday?.timeSpent ?? 0
    const timeSpentTodayMinutes = Math.round(timeSpentTodaySeconds / 60)

    const cardProgress = Math.min(
      100,
      Math.round((cardsStudiedToday / cardTarget) * 100)
    )
    const timeProgressMinutes = Math.min(
      100,
      Math.round((timeSpentTodayMinutes / timeTargetMinutes) * 100)
    )

    const isCardTargetMet = cardsStudiedToday >= cardTarget
    const isTimeTargetMet = timeSpentTodayMinutes >= timeTargetMinutes

    return NextResponse.json({
      date: todayStr,
      cardTarget,
      timeTargetMinutes,
      cardsStudiedToday,
      timeSpentTodaySeconds,
      timeSpentTodayMinutes,
      cardProgress,
      timeProgressMinutes,
      isCardTargetMet,
      isTimeTargetMet,
      currentStreak: goal?.currentStreak ?? (cardsStudiedToday > 0 ? 1 : 0),
      longestStreak: goal?.longestStreak ?? (cardsStudiedToday > 0 ? 1 : 0),
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/goals/progress:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi tính toán tiến độ mục tiêu." },
      { status: 500 }
    )
  }
}
