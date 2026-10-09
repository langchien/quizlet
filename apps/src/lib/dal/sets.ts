import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"

export interface GetSetsOptions {
  userId: string
  page?: number
  limit?: number
  search?: string
  folderId?: string | null
  sortBy?: "updatedAt" | "createdAt" | "name" | "cardCount"
  sortOrder?: "asc" | "desc"
}

/**
 * Lấy danh sách bộ thẻ kèm phân trang, tìm kiếm và tiến độ học tập (Cached per request)
 */
export const getSets = cache(async (options: GetSetsOptions) => {
  const {
    userId,
    page = 1,
    limit = 20,
    search = "",
    folderId,
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = options

  const safePage = Math.max(1, page)
  const safeLimit = Math.min(100, Math.max(1, limit))
  const skip = (safePage - 1) * safeLimit

  const where: Prisma.StudySetWhereInput = {
    userId,
  }

  if (search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
    ]
  }

  if (folderId !== undefined && folderId !== null && folderId !== "") {
    if (folderId === "none" || folderId === "null" || folderId === "root") {
      where.folderId = null
    } else {
      where.folderId = folderId
    }
  }

  let orderBy: Prisma.StudySetOrderByWithRelationInput = {
    updatedAt: sortOrder,
  }
  if (sortBy === "createdAt") {
    orderBy = { createdAt: sortOrder }
  } else if (sortBy === "name") {
    orderBy = { name: sortOrder }
  } else if (sortBy === "cardCount") {
    orderBy = { cardCount: sortOrder }
  }

  const [total, sets] = await Promise.all([
    prisma.studySet.count({ where }),
    prisma.studySet.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        studySessions: {
          where: { userId },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { startedAt: true },
        },
        cards: {
          select: {
            id: true,
            srsData: {
              where: { userId },
              select: { status: true },
              take: 1,
            },
          },
        },
      },
    }),
  ])

  const formattedItems = sets.map((set) => {
    let masteredCount = 0
    let learningCount = 0
    let newCount = 0

    set.cards.forEach((card) => {
      const srs = card.srsData[0]
      if (!srs || srs.status === "New") {
        newCount++
      } else if (srs.status === "Mastered") {
        masteredCount++
      } else {
        learningCount++
      }
    })

    const totalCards = set.cards.length
    const percentage =
      totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0

    return {
      id: set.id,
      name: set.name,
      description: set.description,
      sourceLanguage: set.sourceLanguage,
      targetLanguage: set.targetLanguage,
      folderId: set.folderId,
      userId: set.userId,
      cardCount: set.cardCount,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      folder: set.folder,
      lastStudiedAt: set.studySessions[0]?.startedAt || null,
      progress: {
        mastered: masteredCount,
        learning: learningCount,
        new: newCount,
        percentage,
      },
    }
  })

  return {
    items: formattedItems,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  }
})

/**
 * Lấy chi tiết một bộ thẻ cùng đầy đủ danh sách thẻ, tags và trạng thái SRS
 */
export const getSetById = cache(async (id: string, userId: string) => {
  const set = await prisma.studySet.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
      cards: {
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
      },
      studySessions: {
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { startedAt: true },
      },
    },
  })

  if (!set) return null

  let masteredCount = 0
  let learningCount = 0
  let newCount = 0

  const formattedCards = set.cards.map((card) => {
    const srs = card.srsData[0] || null
    if (!srs || srs.status === "New") {
      newCount++
    } else if (srs.status === "Mastered") {
      masteredCount++
    } else {
      learningCount++
    }

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

  const totalCards = formattedCards.length
  const percentage =
    totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0

  return {
    id: set.id,
    name: set.name,
    description: set.description,
    sourceLanguage: set.sourceLanguage,
    targetLanguage: set.targetLanguage,
    folderId: set.folderId,
    userId: set.userId,
    cardCount: set.cardCount,
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
    folder: set.folder,
    lastStudiedAt: set.studySessions[0]?.startedAt || null,
    cards: formattedCards,
    progress: {
      mastered: masteredCount,
      learning: learningCount,
      new: newCount,
      percentage,
    },
  }
})
