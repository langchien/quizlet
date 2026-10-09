import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xuất dữ liệu thống kê." },
        { status: 401 }
      )
    }

    const [userGoal, dailyStats, srsStats, sessions, sets] = await Promise.all([
      prisma.userGoal.findUnique({
        where: { userId: user.id },
      }),
      prisma.dailyStats.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" },
      }),
      prisma.sRSData.findMany({
        where: { userId: user.id },
        select: {
          status: true,
          easeFactor: true,
          interval: true,
          repetitions: true,
          correctCount: true,
          incorrectCount: true,
          lastReviewDate: true,
          nextReviewDate: true,
        },
      }),
      prisma.studySession.findMany({
        where: { userId: user.id },
        orderBy: { startedAt: "desc" },
        include: {
          studySet: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.studySet.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          cardCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    // Phân bố SRS
    const srsDistribution = {
      New: 0,
      Learning: 0,
      Review: 0,
      Mastered: 0,
    }

    for (const item of srsStats) {
      if (item.status in srsDistribution) {
        srsDistribution[item.status as keyof typeof srsDistribution] += 1
      }
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      goal: userGoal,
      summary: {
        totalSets: sets.length,
        totalCards: sets.reduce((acc, s) => acc + s.cardCount, 0),
        srsDistribution,
        totalSessions: sessions.length,
        totalDaysRecorded: dailyStats.length,
      },
      dailyStats,
      sessions,
      sets,
    }

    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="nihomemo_stats_report_${new Date().toISOString().split("T")[0]}.json"`,
      },
    })

    return response
  } catch (error) {
    console.error("❌ Lỗi GET /api/stats/export:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi xuất báo cáo thống kê." },
      { status: 500 }
    )
  }
}
