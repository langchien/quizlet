import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type { Prisma, JLPTLevel, WordType, CardStatus } from "@/generated/prisma/client"

export interface GetCardsOptions {
  search?: string
  jlptLevel?: string
  wordType?: string
  tagId?: string
  srsStatus?: string
}

/**
 * Lấy danh sách thẻ trong bộ thẻ theo các tiêu chí lọc (Cached per request)
 */
export const getCardsBySetId = cache(
  async (setId: string, userId: string, options: GetCardsOptions = {}) => {
    // Kiểm tra quyền sở hữu bộ thẻ
    const studySet = await prisma.studySet.findFirst({
      where: { id: setId, userId },
      select: { id: true },
    })

    if (!studySet) return null

    const { search = "", jlptLevel, wordType, tagId, srsStatus } = options

    const where: Prisma.CardWhereInput = {
      studySetId: setId,
    }

    if (search.trim()) {
      where.OR = [
        { term: { contains: search.trim(), mode: "insensitive" } },
        { reading: { contains: search.trim(), mode: "insensitive" } },
        { definition: { contains: search.trim(), mode: "insensitive" } },
        { example: { contains: search.trim(), mode: "insensitive" } },
      ]
    }

    if (jlptLevel) {
      where.jlptLevel = jlptLevel as JLPTLevel
    }

    if (wordType) {
      where.wordType = wordType as WordType
    }

    if (tagId) {
      where.cardTags = {
        some: { tagId },
      }
    }

    if (srsStatus) {
      where.srsData = {
        some: {
          userId,
          status: srsStatus as CardStatus,
        },
      }
    }

    const cards = await prisma.card.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        cardTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        srsData: {
          where: { userId },
          take: 1,
        },
      },
    })

    return cards.map((card) => {
      const srs = card.srsData[0] || null
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
        order: card.order,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        tags: card.cardTags.map((ct) => ct.tag),
        srsData: srs
          ? {
              status: srs.status,
              interval: srs.interval,
              repetitions: srs.repetitions,
              easeFactor: srs.easeFactor,
              nextReview: srs.nextReviewDate,
            }
          : null,
      }
    })
  }
)

/**
 * Lấy chi tiết một thẻ học theo ID
 */
export const getCardById = cache(async (cardId: string, userId: string) => {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      studySet: { userId },
    },
    include: {
      cardTags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      srsData: {
        where: { userId },
        take: 1,
      },
    },
  })

  if (!card) return null

  const srs = card.srsData[0] || null
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
    order: card.order,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    tags: card.cardTags.map((ct) => ct.tag),
    srsData: srs
      ? {
          status: srs.status,
          interval: srs.interval,
          repetitions: srs.repetitions,
          easeFactor: srs.easeFactor,
          nextReview: srs.nextReviewDate,
        }
      : null,
  }
})
