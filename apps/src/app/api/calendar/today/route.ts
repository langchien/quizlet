import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { getTodayDateString } from "@/lib/srs"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem danh sách thẻ cần ôn hôm nay." },
        { status: 401 }
      )
    }

    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)
    const todayStr = getTodayDateString()

    // 1. Lấy tất cả SRSData đến hạn hôm nay (bao gồm cả quá hạn)
    const dueSRSList = await prisma.sRSData.findMany({
      where: {
        userId: user.id,
        nextReviewDate: { lte: endOfToday },
      },
      orderBy: [{ nextReviewDate: "asc" }, { easeFactor: "asc" }],
      include: {
        card: {
          include: {
            studySet: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    let overdueCount = 0
    let dueTodayCount = 0

    const cards = dueSRSList.map((item) => {
      const reviewDate = new Date(item.nextReviewDate)
      const isOverdue = reviewDate < startOfToday

      if (isOverdue) {
        overdueCount += 1
      } else {
        dueTodayCount += 1
      }

      return {
        id: item.card.id,
        term: item.card.term,
        reading: item.card.reading,
        definition: item.card.definition,
        example: item.card.example,
        imageUrl: item.card.imageUrl,
        audioUrl: item.card.audioUrl,
        jlptLevel: item.card.jlptLevel,
        wordType: item.card.wordType,
        studySet: {
          id: item.card.studySet.id,
          name: item.card.studySet.name,
        },
        srs: {
          status: item.status,
          easeFactor: item.easeFactor,
          interval: item.interval,
          repetitions: item.repetitions,
          nextReviewDate: item.nextReviewDate,
          lastReviewDate: item.lastReviewDate,
          correctCount: item.correctCount,
          incorrectCount: item.incorrectCount,
          isOverdue,
        },
      }
    })

    // 2. Dự báo 7 ngày tới (bắt đầu từ ngày mai)
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    const forecastDates: {
      dateStr: string
      dayName: string
      start: Date
      end: Date
    }[] = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + i)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      const dateStr = `${year}-${month}-${day}`
      const dayName =
        i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : dayNames[d.getDay()]

      const start = new Date(d)
      start.setHours(0, 0, 0, 0)
      const end = new Date(d)
      end.setHours(23, 59, 59, 999)

      forecastDates.push({ dateStr, dayName, start, end })
    }

    const forecast7Days = await Promise.all(
      forecastDates.map(async ({ dateStr, dayName, start, end }, index) => {
        let count = 0
        if (index === 0) {
          // Hôm nay bao gồm cả thẻ quá hạn
          count = cards.length
        } else {
          count = await prisma.sRSData.count({
            where: {
              userId: user.id,
              nextReviewDate: { gte: start, lte: end },
            },
          })
        }
        return {
          date: dateStr,
          dayName,
          dueCount: count,
        }
      })
    )

    return NextResponse.json({
      today: todayStr,
      totalDue: cards.length,
      overdueCount,
      dueTodayCount,
      cards,
      forecast7Days,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/calendar/today:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách thẻ hôm nay." },
      { status: 500 }
    )
  }
}
