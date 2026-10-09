import { prisma } from "@/lib/prisma"

export interface SearchResults {
  query: string
  results: {
    sets: Array<{
      id: string
      name: string
      description: string | null
      cardCount: number
      updatedAt: Date
      folder: { id: string; name: string } | null
    }>
    cards: Array<{
      id: string
      term: string
      reading: string | null
      definition: string
      studySetId: string
      studySetName: string
      jlptLevel: string | null
      wordType: string | null
      tags: Array<{ id: string; name: string; color: string }>
    }>
    folders: Array<{
      id: string
      name: string
      description: string | null
      _count: { studySets: number; children: number }
    }>
    tags: Array<{
      id: string
      name: string
      color: string
      cardCount: number
    }>
  }
  total: number
}

/**
 * Tìm kiếm toàn cục trên bộ thẻ, thẻ học, thư mục và nhãn
 */
export async function globalSearch(
  userId: string,
  query: string,
  limit: number = 10
): Promise<SearchResults> {
  const q = query.trim()
  const take = Math.min(20, Math.max(1, limit))

  if (!q) {
    return {
      query: "",
      results: {
        sets: [],
        cards: [],
        folders: [],
        tags: [],
      },
      total: 0,
    }
  }

  // Thực hiện tìm kiếm song song
  const [sets, cards, folders, tags] = await Promise.all([
    // 1. Tìm trong StudySets
    prisma.studySet.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        cardCount: true,
        updatedAt: true,
        folder: {
          select: { id: true, name: true },
        },
      },
    }),

    // 2. Tìm trong Cards
    prisma.card.findMany({
      where: {
        studySet: {
          userId,
        },
        OR: [
          { term: { contains: q, mode: "insensitive" } },
          { reading: { contains: q, mode: "insensitive" } },
          { definition: { contains: q, mode: "insensitive" } },
          { example: { contains: q, mode: "insensitive" } },
          { exampleTranslation: { contains: q, mode: "insensitive" } },
          { note: { contains: q, mode: "insensitive" } },
          { onReading: { contains: q, mode: "insensitive" } },
          { kunReading: { contains: q, mode: "insensitive" } },
          { compounds: { contains: q, mode: "insensitive" } },
        ],
      },
      take,
      orderBy: { updatedAt: "desc" },
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
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    }),

    // 3. Tìm trong Folders
    prisma.folder.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { studySets: true, children: true },
        },
      },
    }),

    // 4. Tìm trong Tags
    prisma.tag.findMany({
      where: {
        userId,
        name: { contains: q, mode: "insensitive" },
      },
      take,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { cardTags: true },
        },
      },
    }),
  ])

  const formattedCards = cards.map((c) => ({
    id: c.id,
    term: c.term,
    reading: c.reading,
    definition: c.definition,
    studySetId: c.studySetId,
    studySetName: c.studySet.name,
    jlptLevel: c.jlptLevel,
    wordType: c.wordType,
    tags: c.cardTags.map((ct) => ct.tag),
  }))

  const formattedTags = tags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    cardCount: t._count.cardTags,
  }))

  const total =
    sets.length + formattedCards.length + folders.length + formattedTags.length

  return {
    query: q,
    results: {
      sets,
      cards: formattedCards,
      folders,
      tags: formattedTags,
    },
    total,
  }
}
