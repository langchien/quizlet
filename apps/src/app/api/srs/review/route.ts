import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { ReviewCardSchema } from "@/schemas/srs"
import { processSRSReview } from "@/lib/srs"

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để đánh giá SRS." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = ReviewCardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu đánh giá SRS không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { cardId, rating, timeTaken, isCorrect } = validation.data

    const updatedSRS = await processSRSReview({
      userId: user.id,
      cardId,
      rating,
      timeTaken,
      isCorrect,
    })

    return NextResponse.json({
      success: true,
      srsData: updatedSRS,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/srs/review:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi cập nhật SRS." },
      { status: 500 }
    )
  }
}
