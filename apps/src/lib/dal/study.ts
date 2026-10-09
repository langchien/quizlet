import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type { Prisma, JLPTLevel } from "@/generated/prisma/client"
import type { StartSessionBody } from "@/schemas/session"

export interface StudyCardItem {
  id: string
  studySetId: string
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  note?: string | null
  jlptLevel?: string | null
  wordType?: string | null
  radicals?: string | null
  strokeCount?: number | null
  onReading?: string | null
  kunReading?: string | null
  compounds?: string | null
  order: number
  tags: Array<{ id: string; name: string; color: string }>
  srsData: {
    id?: string
    status: string
    easeFactor: number
    interval: number
    repetitions: number
    correctCount: number
    incorrectCount: number
    nextReviewDate?: Date | null
  }
  studySet?: {
    id: string
    name: string
  } | null
}

/**
 * Lấy thông tin bộ thẻ và danh sách Tags phục vụ trang chọn chế độ học tập (RSC Cached)
 */
export const getStudySetForStudyPage = cache(
  async (userId: string, setId: string) => {
    const [set, tags, srsCounts] = await Promise.all([
      prisma.studySet.findFirst({
        where: { id: setId, userId },
        include: {
          folder: {
            select: { id: true, name: true },
          },
          _count: {
            select: { cards: true },
          },
        },
      }),
      prisma.tag.findMany({
        where: { userId },
        select: { id: true, name: true, color: true },
        orderBy: { name: "asc" },
      }),
      prisma.sRSData.groupBy({
        by: ["status"],
        where: {
          userId,
          card: { studySetId: setId },
        },
        _count: { _all: true },
      }),
    ])

    if (!set) return null

    const totalCards = set._count.cards
    const srsMap: Record<string, number> = {
      Mastered: 0,
      Learning: 0,
      Review: 0,
      New: 0,
    }

    for (const item of srsCounts) {
      srsMap[item.status] = item._count._all
    }

    // Số thẻ New thực tế bao gồm cả những thẻ chưa có SRSData
    const cardsWithSRS =
      srsMap.Mastered + srsMap.Learning + srsMap.Review + srsMap.New
    const unreviewedNew = Math.max(0, totalCards - cardsWithSRS)
    const effectiveNew = srsMap.New + unreviewedNew

    const percentage =
      totalCards > 0 ? Math.round((srsMap.Mastered / totalCards) * 100) : 0

    return {
      setDetail: {
        id: set.id,
        name: set.name,
        description: set.description,
        cardCount: totalCards,
        folder: set.folder,
        progress: {
          mastered: srsMap.Mastered,
          learning: srsMap.Learning + srsMap.Review,
          new: effectiveNew,
          percentage,
        },
      },
      tags,
    }
  }
)

/**
 * Chuẩn bị danh sách thẻ học cho phiên học theo bộ lọc và tùy chọn (shuffle, status, tags, limit)
 */
export async function getCardsForStudySession(
  userId: string,
  options: StartSessionBody
): Promise<StudyCardItem[]> {
  const { studySetId, shuffle, filterByStatus, filterByTags, limit } = options

  const cardWhere: Prisma.CardWhereInput = {}

  if (studySetId) {
    cardWhere.studySetId = studySetId
    cardWhere.studySet = { userId }
  } else {
    cardWhere.studySet = { userId }
  }

  if (filterByTags && filterByTags.length > 0) {
    cardWhere.cardTags = {
      some: {
        tagId: { in: filterByTags },
      },
    }
  }

  const rawCards = await prisma.card.findMany({
    where: cardWhere,
    orderBy: { order: "asc" },
    include: {
      cardTags: {
        include: {
          tag: {
            select: { id: true, name: true, color: true },
          },
        },
      },
      srsData: {
        where: { userId },
        select: {
          id: true,
          status: true,
          easeFactor: true,
          interval: true,
          repetitions: true,
          nextReviewDate: true,
          correctCount: true,
          incorrectCount: true,
        },
      },
      studySet: {
        select: { id: true, name: true },
      },
    },
  })

  let filteredCards: StudyCardItem[] = rawCards.map((c) => ({
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
    srsData: c.srsData[0] || {
      status: "New",
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      correctCount: 0,
      incorrectCount: 0,
    },
    studySet: c.studySet,
  }))

  if (filterByStatus && filterByStatus !== "All") {
    filteredCards = filteredCards.filter(
      (c) => c.srsData.status === filterByStatus
    )
  }

  if (shuffle) {
    for (let i = filteredCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[filteredCards[i], filteredCards[j]] = [
        filteredCards[j],
        filteredCards[i],
      ]
    }
  }

  if (limit && limit > 0) {
    filteredCards = filteredCards.slice(0, limit)
  }

  return filteredCards
}

/**
 * Lấy danh sách thẻ thường làm sai (Cached per request)
 */
export const getMistakeCards = cache(
  async (
    userId: string,
    options: {
      studySetId?: string | null
      jlpt?: JLPTLevel | null
      sortBy?: string
    } = {}
  ) => {
    const { studySetId, jlpt, sortBy = "incorrectCount" } = options

    const where: Prisma.SRSDataWhereInput = {
      userId,
      incorrectCount: { gt: 0 },
    }

    if (studySetId) {
      where.card = { studySetId }
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

    return srsItems.map((srs) => {
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
          correctCount: srs.correctCount,
          incorrectCount: srs.incorrectCount,
          lastReviewDate: srs.lastReviewDate,
        },
        stats: {
          totalAttempts,
          accuracy,
          incorrectCount: srs.incorrectCount,
        },
      }
    })
  }
)
