import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { AnswerQuestionSchema } from "@/schemas/session"
import { processSRSReview } from "@/lib/srs"

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = AnswerQuestionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu câu trả lời không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { sessionId, cardId, isCorrect, timeTaken } = validation.data

    // 1. Kiểm tra card tồn tại
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true },
    })

    if (!card) {
      return NextResponse.json(
        { error: "Thẻ học tập không tồn tại." },
        { status: 404 }
      )
    }

    // 2. Xử lý SRS Review, DailyStats và UserGoals
    const updatedSRS = await processSRSReview({
      userId: user.id,
      cardId,
      isCorrect,
      timeTaken: timeTaken || 0,
    })

    // 3. Nếu có sessionId, cập nhật StudySession
    let updatedSession = null
    if (sessionId) {
      const session = await prisma.studySession.findFirst({
        where: { id: sessionId, userId: user.id },
      })

      if (session) {
        const newCorrect = session.correctCards + (isCorrect ? 1 : 0)
        const newIncorrect = session.incorrectCards + (isCorrect ? 0 : 1)
        const answeredTotal = newCorrect + newIncorrect
        const score =
          answeredTotal > 0 ? Math.round((newCorrect / answeredTotal) * 100) : 0

        updatedSession = await prisma.studySession.update({
          where: { id: sessionId },
          data: {
            correctCards: newCorrect,
            incorrectCards: newIncorrect,
            duration: { increment: timeTaken || 0 },
            score,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      srsData: updatedSRS,
      session: updatedSession,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/study/answer:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lưu kết quả câu trả lời." },
      { status: 500 }
    )
  }
}
