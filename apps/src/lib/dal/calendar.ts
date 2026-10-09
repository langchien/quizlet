import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getTodayDateString } from "@/lib/srs"

/**
 * Lấy dữ liệu lịch ôn tập theo tháng (Cached per request)
 */
export const getCalendarDue = cache(
  async (userId: string, yearParam?: number, monthParam?: number) => {
    const now = new Date()
    const year = yearParam ?? now.getFullYear()
    const month = monthParam ?? now.getMonth() + 1

    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    const allSRS = await prisma.sRSData.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        nextReviewDate: true,
      },
    })

    const daysInMonth = endOfMonth.getDate()
    const days: Record<
      string,
      {
        date: string
        dueCount: number
        newCount: number
        learningCount: number
        reviewCount: number
      }
    > = {}

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      days[dateStr] = {
        date: dateStr,
        dueCount: 0,
        newCount: 0,
        learningCount: 0,
        reviewCount: 0,
      }
    }

    let overdueCount = 0
    let totalDueInMonth = 0

    for (const item of allSRS) {
      if (!item.nextReviewDate) continue
      const reviewDate = new Date(item.nextReviewDate)
      const reviewYear = reviewDate.getFullYear()
      const reviewMonth = reviewDate.getMonth() + 1
      const reviewDay = reviewDate.getDate()
      const reviewDateStr = `${reviewYear}-${String(reviewMonth).padStart(2, "0")}-${String(reviewDay).padStart(2, "0")}`

      if (reviewDate < startOfToday) {
        overdueCount += 1
        if (days[todayStr]) {
          days[todayStr].dueCount += 1
          if (item.status === "New") days[todayStr].newCount += 1
          else if (item.status === "Learning") days[todayStr].learningCount += 1
          else if (item.status === "Review") days[todayStr].reviewCount += 1
        }
      } else if (reviewYear === year && reviewMonth === month) {
        if (days[reviewDateStr]) {
          days[reviewDateStr].dueCount += 1
          totalDueInMonth += 1
          if (item.status === "New") days[reviewDateStr].newCount += 1
          else if (item.status === "Learning")
            days[reviewDateStr].learningCount += 1
          else if (item.status === "Review")
            days[reviewDateStr].reviewCount += 1
        }
      }
    }

    return {
      year,
      month,
      overdueCount,
      totalDueInMonth,
      days: Object.values(days),
    }
  }
)

/**
 * Lấy danh sách thẻ cần ôn tập hôm nay và dự báo 7 ngày (Cached per request)
 */
export const getCalendarToday = cache(async (userId: string) => {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)
  const todayStr = getTodayDateString()

  const dueSRSList = await prisma.sRSData.findMany({
    where: {
      userId,
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

    if (isOverdue) overdueCount += 1
    else dueTodayCount += 1

    return {
      id: item.card.id,
      term: item.card.term,
      reading: item.card.reading,
      definition: item.card.definition,
      example: item.card.example,
      imageUrl: item.card.imageUrl,
      jlptLevel: item.card.jlptLevel,
      status: item.status,
      nextReviewDate: item.nextReviewDate,
      isOverdue,
      studySet: item.card.studySet,
    }
  })

  const forecast = []
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() + i)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const dateStr = `${dayStart.getFullYear()}-${String(dayStart.getMonth() + 1).padStart(2, "0")}-${String(dayStart.getDate()).padStart(2, "0")}`

    let count: number
    if (i === 0) {
      count = dueSRSList.length
    } else {
      count = await prisma.sRSData.count({
        where: {
          userId,
          nextReviewDate: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      })
    }

    forecast.push({ date: dateStr, dueCount: count })
  }

  const [studiedToday, goal] = await Promise.all([
    prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr,
        },
      },
      select: { cardsStudied: true },
    }),
    prisma.userGoal.findUnique({
      where: { userId },
      select: { dailyCardTarget: true },
    }),
  ])

  return {
    todayStr,
    totalDue: cards.length,
    overdueCount,
    dueTodayCount,
    cardsStudiedToday: studiedToday?.cardsStudied ?? 0,
    dailyCardTarget: goal?.dailyCardTarget ?? 20,
    cards,
    forecast,
  }
})
