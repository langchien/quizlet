import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"

/**
 * Lấy danh sách các thẻ cần ôn tập theo Spaced Repetition (RSC Cached)
 */
export const getDueCards = cache(
  async (
    userId: string,
    options: {
      studySetId?: string | null
      limit?: number
    } = {}
  ) => {
    const { studySetId, limit = 50 } = options
    const cappedLimit = Math.min(200, Math.max(1, limit))

    const now = new Date()
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    const cardWhere: Prisma.CardWhereInput = studySetId
      ? { studySetId, studySet: { userId } }
      : { studySet: { userId } }

    // 1. Lấy cards đã có SRS data và đến hạn ôn (nextReviewDate <= endOfToday)
    const dueSRSData = await prisma.sRSData.findMany({
      where: {
        userId,
        nextReviewDate: { lte: endOfToday },
        status: { not: "Mastered" },
        card: cardWhere,
      },
      orderBy: { nextReviewDate: "asc" },
      take: cappedLimit,
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
          { srsData: { none: { userId } } },
          { srsData: { some: { userId, status: "New" } } },
        ],
      },
      take: cappedLimit,
      include: {
        studySet: { select: { id: true, name: true } },
        cardTags: {
          include: {
            tag: { select: { id: true, name: true, color: true } },
          },
        },
      },
    })

    const formattedDue = dueSRSData.map((item) => ({
      ...item.card,
      tags: item.card.cardTags.map((ct) => ct.tag),
      srsData: {
        id: item.id,
        status: item.status,
        easeFactor: item.easeFactor,
        interval: item.interval,
        repetitions: item.repetitions,
        nextReviewDate: item.nextReviewDate,
        lastReviewDate: item.lastReviewDate,
        correctCount: item.correctCount,
        incorrectCount: item.incorrectCount,
      },
      isNew: false,
    }))

    const dueCardIds = new Set(formattedDue.map((c) => c.id))
    const formattedNew = newCards
      .filter((card) => !dueCardIds.has(card.id))
      .map((card) => ({
        ...card,
        tags: card.cardTags.map((ct) => ct.tag),
        srsData: {
          status: "New",
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: null,
          lastReviewDate: null,
          correctCount: 0,
          incorrectCount: 0,
        },
        isNew: true,
      }))

    return {
      dueCount: formattedDue.length,
      newCount: formattedNew.length,
      reviewCount: formattedDue.length,
      cards: [...formattedDue, ...formattedNew].slice(0, cappedLimit),
    }
  }
)

/**
 * Đếm số lượng thẻ đến hạn ôn tập và phân bố theo nhóm (RSC Cached)
 */
export const getDueCount = cache(
  async (userId: string, studySetId?: string | null) => {
    const now = new Date()
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    const cardWhere: Prisma.CardWhereInput = studySetId
      ? { studySetId, studySet: { userId } }
      : { studySet: { userId } }

    const [dueReviewCount, newCardsCount, learningCount, masteredCount] =
      await Promise.all([
        prisma.sRSData.count({
          where: {
            userId,
            nextReviewDate: { lte: endOfToday },
            status: { in: ["Learning", "Review"] },
            card: cardWhere,
          },
        }),
        prisma.card.count({
          where: {
            ...cardWhere,
            OR: [
              { srsData: { none: { userId } } },
              { srsData: { some: { userId, status: "New" } } },
            ],
          },
        }),
        prisma.sRSData.count({
          where: {
            userId,
            status: "Learning",
            card: cardWhere,
          },
        }),
        prisma.sRSData.count({
          where: {
            userId,
            status: "Mastered",
            card: cardWhere,
          },
        }),
      ])

    return {
      totalDue: dueReviewCount + newCardsCount,
      dueReviewCount,
      newCardsCount,
      learningCount,
      masteredCount,
    }
  }
)

/**
 * Lấy trạng thái SRS chi tiết của một thẻ cụ thể (RSC Cached)
 */
export const getCardSRSStatus = cache(
  async (userId: string, cardId: string) => {
    const srs = await prisma.sRSData.findUnique({
      where: {
        cardId_userId: {
          cardId,
          userId,
        },
      },
    })

    if (!srs) {
      return {
        status: "New",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: null,
        correctCount: 0,
        incorrectCount: 0,
      }
    }

    return srs
  }
)
