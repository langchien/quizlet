import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập dữ liệu Heatmap." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const yearParam = searchParams.get("year")

    let startDate: Date
    let endDate: Date

    if (yearParam && !isNaN(parseInt(yearParam))) {
      const year = parseInt(yearParam)
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
    } else {
      // 365 ngày gần nhất
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 364)
    }

    const startStr = startDate.toISOString().split("T")[0]
    const endStr = endDate.toISOString().split("T")[0]

    const stats = await prisma.dailyStats.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startStr,
          lte: endStr,
        },
      },
    })

    const statsMap = new Map(stats.map((s) => [s.date, s]))

    // Tạo danh sách đầy đủ tất cả các ngày trong khoảng thời gian
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

      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (count >= 40) level = 4
      else if (count >= 20) level = 3
      else if (count >= 10) level = 2
      else if (count >= 1) level = 1

      result.push({
        date: dateStr,
        count,
        level,
        timeSpent,
      })

      cur.setDate(cur.getDate() + 1)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Lỗi GET /api/stats/heatmap:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy dữ liệu Heatmap." },
      { status: 500 }
    )
  }
}
