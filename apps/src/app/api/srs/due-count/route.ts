import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem số lượng thẻ cần ôn." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const studySetId = searchParams.get("studySetId")

    const now = new Date()
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    const cardWhere = studySetId
      ? { studySetId }
      : { studySet: { userId: user.id } }

    const [dueReviewCount, newCardsCount, learningCount, masteredCount] =
      await Promise.all([
        prisma.sRSData.count({
          where: {
            userId: user.id,
            nextReviewDate: { lte: endOfToday },
            status: { in: ["Learning", "Review"] },
            card: cardWhere,
          },
        }),
        prisma.card.count({
          where: {
            ...cardWhere,
            OR: [
              { srsData: { none: { userId: user.id } } },
              { srsData: { some: { userId: user.id, status: "New" } } },
            ],
          },
        }),
        prisma.sRSData.count({
          where: {
            userId: user.id,
            status: "Learning",
            card: cardWhere,
          },
        }),
        prisma.sRSData.count({
          where: {
            userId: user.id,
            status: "Mastered",
            card: cardWhere,
          },
        }),
      ])

    return NextResponse.json({
      dueCount: dueReviewCount + newCardsCount,
      reviewCount: dueReviewCount,
      newCount: newCardsCount,
      learningCount,
      masteredCount,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/srs/due-count:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi đếm số lượng thẻ cần ôn." },
      { status: 500 }
    )
  }
}
