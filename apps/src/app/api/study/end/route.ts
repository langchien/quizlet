import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { EndSessionSchema } from "@/schemas/session"

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để kết thúc phiên học." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = EndSessionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu kết thúc phiên học không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const {
      sessionId,
      studySetId,
      mode,
      duration,
      totalCards,
      correctCards,
      incorrectCards,
      score,
    } = validation.data

    let session = null

    if (sessionId) {
      const existing = await prisma.studySession.findFirst({
        where: { id: sessionId, userId: user.id },
      })

      if (existing) {
        session = await prisma.studySession.update({
          where: { id: sessionId },
          data: {
            endedAt: new Date(),
            duration,
            totalCards,
            correctCards,
            incorrectCards,
            score,
          },
          include: {
            studySet: {
              select: { id: true, name: true },
            },
          },
        })
      }
    }

    if (!session) {
      session = await prisma.studySession.create({
        data: {
          userId: user.id,
          studySetId: studySetId || null,
          mode,
          startedAt: new Date(Date.now() - duration * 1000),
          endedAt: new Date(),
          duration,
          totalCards,
          correctCards,
          incorrectCards,
          score,
        },
        include: {
          studySet: {
            select: { id: true, name: true },
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      session,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/study/end:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi kết thúc phiên học." },
      { status: 500 }
    )
  }
}
