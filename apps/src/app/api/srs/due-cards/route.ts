import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import type { Prisma } from "@/generated/prisma/client"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để lấy danh sách thẻ cần ôn." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const studySetId = searchParams.get("studySetId")
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    )

    const now = new Date()
    // Cuối ngày hôm nay
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    // Điều kiện thẻ của user
    const cardWhere: Prisma.CardWhereInput = studySetId
      ? { studySetId }
      : { studySet: { userId: user.id } }

    // 1. Lấy cards đã có SRS data và đến hạn ôn (nextReviewDate <= endOfToday)
    const dueSRSData = await prisma.sRSData.findMany({
      where: {
        userId: user.id,
        nextReviewDate: { lte: endOfToday },
        status: { not: "Mastered" },
        card: cardWhere,
      },
      orderBy: { nextReviewDate: "asc" },
      take: limit,
      include: {
        card: {
          include: {
            studySet: { select: { id: true, name: true } },
            cardTags: {
              include: {
                tag: { select: { id: true, name: true, color: true } },
              },
            },
          },
        },
      },
    })

    // 2. Lấy cards mới chưa có SRS hoặc status === "New"
    const newCards = await prisma.card.findMany({
      where: {
        ...cardWhere,
        OR: [
          { srsData: { none: { userId: user.id } } },
          { srsData: { some: { userId: user.id, status: "New" } } },
        ],
      },
      take: Math.max(10, Math.floor(limit / 2)),
      include: {
        studySet: { select: { id: true, name: true } },
        cardTags: {
          include: {
            tag: { select: { id: true, name: true, color: true } },
          },
        },
        srsData: {
          where: { userId: user.id },
        },
      },
    })

    // Định dạng danh sách cards
    const reviewCardsFormatted = dueSRSData.map((srs) => ({
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
      studySet: srs.card.studySet,
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
    }))

    const newCardsFormatted = newCards.map((c) => ({
      id: c.id,
      studySetId: c.studySetId,
      term: c.term,
      reading: c.reading,
      definition: c.definition,
      example: c.example,
      exampleTranslation: c.exampleTranslation,
      imageUrl: c.imageUrl,
      audioUrl: c.audioUrl,
      note: c.note,
      jlptLevel: c.jlptLevel,
      wordType: c.wordType,
      radicals: c.radicals,
      strokeCount: c.strokeCount,
      onReading: c.onReading,
      kunReading: c.kunReading,
      compounds: c.compounds,
      order: c.order,
      tags: c.cardTags.map((ct) => ct.tag),
      studySet: c.studySet,
      srsData: c.srsData[0] || {
        status: "New" as const,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        correctCount: 0,
        incorrectCount: 0,
      },
    }))

    // Kết hợp và loại bỏ trùng lặp nếu có
    const combinedMap = new Map<string, (typeof reviewCardsFormatted)[0]>()
    for (const card of reviewCardsFormatted) {
      combinedMap.set(card.id, card)
    }
    for (const card of newCardsFormatted) {
      if (!combinedMap.has(card.id)) {
        combinedMap.set(card.id, card as (typeof reviewCardsFormatted)[0])
      }
    }

    const cards = Array.from(combinedMap.values()).slice(0, limit)

    return NextResponse.json({
      dueCount: dueSRSData.length + newCards.length,
      reviewCount: dueSRSData.length,
      newCount: newCards.length,
      cards,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/srs/due-cards:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách thẻ cần ôn." },
      { status: 500 }
    )
  }
}
