import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"

export interface TagWithCount {
  id: string
  name: string
  color: string
  userId: string
  cardCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Lấy danh sách tất cả nhãn của người dùng kèm số lượng thẻ
 */
export async function getTags(
  userId: string,
  search?: string
): Promise<TagWithCount[]> {
  const where: Prisma.TagWhereInput = {
    userId,
  }

  if (search && search.trim()) {
    where.name = { contains: search.trim(), mode: "insensitive" }
  }

  const tags = await prisma.tag.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { cardTags: true },
      },
    },
  })

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    userId: tag.userId,
    cardCount: tag._count.cardTags,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
  }))
}

/**
 * Lấy chi tiết nhãn theo ID
 */
export async function getTagById(
  id: string,
  userId: string
): Promise<TagWithCount | null> {
  const tag = await prisma.tag.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: { cardTags: true },
      },
    },
  })

  if (!tag) return null

  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    userId: tag.userId,
    cardCount: tag._count.cardTags,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
  }
}

/**
 * Lấy tất cả thẻ được gắn nhãn này xuyên suốt các bộ thẻ
 */
export async function getTagWithCards(id: string, userId: string) {
  const tag = await prisma.tag.findFirst({
    where: { id, userId },
  })

  if (!tag) return null

  const cardTags = await prisma.cardTag.findMany({
    where: {
      tagId: id,
      card: {
        studySet: {
          userId,
        },
      },
    },
    include: {
      card: {
        include: {
          studySet: {
            select: {
              id: true,
              name: true,
            },
          },
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
    },
  })

  const cards = cardTags.map((ct) => {
    const card = ct.card
    const srs = card.srsData[0] || null

    return {
      id: card.id,
      studySetId: card.studySetId,
      studySet: card.studySet,
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
      tags: card.cardTags.map((t) => t.tag),
      srsData: srs,
    }
  })

  return {
    tag: {
      id: tag.id,
      name: tag.name,
      color: tag.color,
    },
    total: cards.length,
    cards,
  }
}

/**
 * Tìm kiếm nhãn cho autocomplete
 */
export async function searchTags(
  userId: string,
  query: string,
  limit: number = 10
) {
  const q = query.trim()
  const take = Math.min(20, Math.max(1, limit))

  const tags = await prisma.tag.findMany({
    where: {
      userId,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    take,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { cardTags: true },
      },
    },
  })

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    cardCount: t._count.cardTags,
  }))
}
