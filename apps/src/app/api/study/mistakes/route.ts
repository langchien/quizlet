import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import type { Prisma, JLPTLevel } from "@/generated/prisma/client"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem danh sách lỗi sai." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const studySetId = searchParams.get("studySetId")
    const jlpt = searchParams.get("jlpt") as JLPTLevel | null
    const sortBy = searchParams.get("sortBy") || "incorrectCount"

    const where: Prisma.SRSDataWhereInput = {
      userId: user.id,
      incorrectCount: { gt: 0 },
    }

    if (studySetId) {
      where.card = {
        studySetId,
      }
    }

    if (jlpt) {
      where.card = {
        ...(where.card as Prisma.CardWhereInput),
        jlptLevel: jlpt,
      }
    }

    let orderBy: Prisma.SRSDataOrderByWithRelationInput = {
      incorrectCount: "desc",
    }
    if (sortBy === "lastReviewDate") {
      orderBy = { lastReviewDate: "desc" }
    } else if (sortBy === "leastAccurate") {
      orderBy = { correctCount: "asc" }
    }

    const srsItems = await prisma.sRSData.findMany({
      where,
      orderBy,
      include: {
        card: {
          include: {
            studySet: {
              select: { id: true, name: true },
            },
            cardTags: {
              include: {
                tag: {
                  select: { id: true, name: true, color: true },
                },
              },
            },
          },
        },
      },
    })

    const items = srsItems.map((srs) => {
      const card = srs.card
      const totalAttempts = srs.correctCount + srs.incorrectCount
      const accuracy =
        totalAttempts > 0
          ? Math.round((srs.correctCount / totalAttempts) * 100)
          : 0

      return {
        id: card.id,
        studySetId: card.studySetId,
        term: card.term,
        reading: card.reading,
        definition: card.definition,
        example: card.example,
        exampleTranslation: card.exampleTranslation,
        imageUrl: card.imageUrl,
        audioUrl: card.audioUrl,
        note: card.note,
        jlptLevel: card.jlptLevel,
        wordType: card.wordType,
        radicals: card.radicals,
        strokeCount: card.strokeCount,
        onReading: card.onReading,
        kunReading: card.kunReading,
        compounds: card.compounds,
        studySet: card.studySet,
        tags: card.cardTags.map((ct) => ct.tag),
        srsData: {
          id: srs.id,
          status: srs.status,
          easeFactor: srs.easeFactor,
          interval: srs.interval,
          repetitions: srs.repetitions,
          nextReviewDate: srs.nextReviewDate,
          lastReviewDate: srs.lastReviewDate,
          correctCount: srs.correctCount,
          incorrectCount: srs.incorrectCount,
          accuracy,
        },
      }
    })

    const totalMistakeCards = items.length
    const totalMistakeCount = items.reduce(
      (sum, item) => sum + item.srsData.incorrectCount,
      0
    )

    return NextResponse.json({
      items,
      totalMistakeCards,
      totalMistakeCount,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/study/mistakes:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách lỗi sai." },
      { status: 500 }
    )
  }
}
