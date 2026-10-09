import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem trạng thái SRS." },
        { status: 401 }
      )
    }

    const { cardId } = await params

    const srsData = await prisma.sRSData.findUnique({
      where: {
        cardId_userId: {
          cardId,
          userId: user.id,
        },
      },
    })

    if (!srsData) {
      return NextResponse.json({
        cardId,
        userId: user.id,
        status: "New",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date(),
        lastReviewDate: null,
        correctCount: 0,
        incorrectCount: 0,
      })
    }

    return NextResponse.json(srsData)
  } catch (error) {
    console.error("❌ Lỗi GET /api/srs/card-status/[cardId]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy trạng thái SRS của thẻ." },
      { status: 500 }
    )
  }
}
