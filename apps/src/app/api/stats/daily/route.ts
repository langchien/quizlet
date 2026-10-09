import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập dữ liệu thống kê." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const toParam = searchParams.get("to")
    const fromParam = searchParams.get("from")

    // Mặc định 30 ngày gần nhất
    const now = new Date()
    const defaultTo = now.toISOString().split("T")[0]
    const past30 = new Date(now)
    past30.setDate(past30.getDate() - 29)
    const defaultFrom = past30.toISOString().split("T")[0]

    const fromDate = fromParam || defaultFrom
    const toDate = toParam || defaultTo

    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        userId: user.id,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { date: "asc" },
    })

    const formatted = dailyStats.map((stat) => ({
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

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("❌ Lỗi GET /api/stats/daily:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy dữ liệu thống kê ngày." },
      { status: 500 }
    )
  }
}
