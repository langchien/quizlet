import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { StudyModeEnum } from "@/schemas/session"
import { z } from "zod"
import type { Prisma } from "@/generated/prisma/client"

const ReviewMistakesSchema = z.object({
  studySetId: z.string().optional().nullable(),
  mode: StudyModeEnum.default("Flashcard"),
  limit: z.number().int().positive().optional(),
  shuffle: z.boolean().default(true),
})

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để ôn tập lỗi sai." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = ReviewMistakesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu ôn tập không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { studySetId, mode, limit, shuffle } = validation.data

    const where: Prisma.SRSDataWhereInput = {
      userId: user.id,
      incorrectCount: { gt: 0 },
    }

    if (studySetId) {
      where.card = { studySetId }
    }

    const mistakeItems = await prisma.sRSData.findMany({
      where,
      orderBy: { incorrectCount: "desc" },
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

    let cards = mistakeItems.map((srs) => ({
      id: srs.card.id,
      studySetId: srs.card.studySetId,
      term: srs.card.term,
      reading: srs.card.reading,
      definition: srs.card.definition,
      example: srs.card.example,
      exampleTranslation: srs.card.exampleTranslation,
      imageUrl: srs.card.imageUrl,
      audioUrl: srs.card.audioUrl,
      note: srs.card.note,
      jlptLevel: srs.card.jlptLevel,
      wordType: srs.card.wordType,
      radicals: srs.card.radicals,
      strokeCount: srs.card.strokeCount,
      onReading: srs.card.onReading,
      kunReading: srs.card.kunReading,
      compounds: srs.card.compounds,
      order: srs.card.order,
      tags: srs.card.cardTags.map((ct) => ct.tag),
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
      },
      studySet: srs.card.studySet,
    }))

    if (shuffle) {
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[cards[i], cards[j]] = [cards[j], cards[i]]
      }
    }

    if (limit && limit > 0) {
      cards = cards.slice(0, limit)
    }

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        studySetId: studySetId || null,
        mode,
        startedAt: new Date(),
        totalCards: cards.length,
        correctCards: 0,
        incorrectCards: 0,
        score: 0,
      },
    })

    return NextResponse.json({
      session,
      cards,
      total: cards.length,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/study/review-mistakes:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi bắt đầu phiên ôn tập lỗi sai." },
      { status: 500 }
    )
  }
}
