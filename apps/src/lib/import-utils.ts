import { prisma } from "@/lib/prisma"
import type { JLPTLevel, WordType } from "@/generated/prisma/client"

export interface CardToInsert {
  term: string
  reading?: string | null
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  note?: string | null
  jlptLevel?: JLPTLevel | null
  wordType?: WordType | null
  radicals?: string | null
  strokeCount?: number | null
  onReading?: string | null
  kunReading?: string | null
  compounds?: string | null
  tags?: string[]
}

const DEFAULT_TAG_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
]

function getRandomTagColor(): string {
  return DEFAULT_TAG_COLORS[
    Math.floor(Math.random() * DEFAULT_TAG_COLORS.length)
  ]
}

/**
 * Lưu bộ thẻ và các thẻ vào cơ sở dữ liệu cùng với SRSData và Tags
 */
export async function createImportedStudySet(params: {
  userId: string
  setName: string
  description?: string | null
  sourceLanguage?: string
  targetLanguage?: string
  folderId?: string | null
  globalTags?: string[]
  cards: CardToInsert[]
}): Promise<{
  setId: string
  setName: string
  cardCount: number
}> {
  const {
    userId,
    setName,
    description,
    sourceLanguage = "ja",
    targetLanguage = "vi",
    folderId,
    globalTags = [],
    cards,
  } = params

  if (cards.length === 0) {
    throw new Error("Không có thẻ nào hợp lệ để import.")
  }

  // 1. Kiểm tra folderId nếu có
  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    })
    if (!folder) {
      throw new Error(
        "Thư mục đã chọn không tồn tại hoặc không thuộc quyền của bạn."
      )
    }
  }

  // 2. Tạo StudySet
  const studySet = await prisma.studySet.create({
    data: {
      name: setName.trim(),
      description: description?.trim() || null,
      sourceLanguage,
      targetLanguage,
      folderId: folderId || null,
      userId,
      cardCount: cards.length,
    },
  })

  // 3. Chuẩn bị danh sách tags để upsert
  const allTagNames = new Set<string>()
  globalTags.forEach((t) => {
    const cleaned = t.trim().replace(/^#/, "")
    if (cleaned) allTagNames.add(cleaned)
  })

  cards.forEach((card) => {
    card.tags?.forEach((t) => {
      const cleaned = t.trim().replace(/^#/, "")
      if (cleaned) allTagNames.add(cleaned)
    })
  })

  const tagMap = new Map<string, string>() // tagName -> tagId
  for (const tagName of Array.from(allTagNames)) {
    const tag = await prisma.tag.upsert({
      where: {
        name_userId: {
          name: tagName,
          userId,
        },
      },
      update: {},
      create: {
        name: tagName,
        color: getRandomTagColor(),
        userId,
      },
    })
    tagMap.set(tagName, tag.id)
  }

  // 4. Tạo từng Card, SRSData và CardTag
  for (let idx = 0; idx < cards.length; idx++) {
    const cardData = cards[idx]
    const createdCard = await prisma.card.create({
      data: {
        studySetId: studySet.id,
        term: cardData.term.trim(),
        reading: (cardData.reading || cardData.term).trim(),
        definition: cardData.definition.trim(),
        example: cardData.example?.trim() || null,
        exampleTranslation: cardData.exampleTranslation?.trim() || null,
        imageUrl: cardData.imageUrl || null,
        audioUrl: cardData.audioUrl || null,
        note: cardData.note?.trim() || null,
        jlptLevel: cardData.jlptLevel || null,
        wordType: cardData.wordType || null,
        radicals: cardData.radicals || null,
        strokeCount: cardData.strokeCount || null,
        onReading: cardData.onReading || null,
        kunReading: cardData.kunReading || null,
        compounds: cardData.compounds || null,
        order: idx,
      },
    })

    // Tạo bản ghi SRS ban đầu
    await prisma.sRSData.create({
      data: {
        cardId: createdCard.id,
        userId,
        status: "New",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date(),
      },
    })

    // Gán tags
    const cardTagNames = new Set<string>([
      ...globalTags.map((t) => t.trim().replace(/^#/, "")),
      ...(cardData.tags || []).map((t) => t.trim().replace(/^#/, "")),
    ])

    for (const tagName of Array.from(cardTagNames)) {
      const tagId = tagMap.get(tagName)
      if (tagId) {
        await prisma.cardTag.create({
          data: {
            cardId: createdCard.id,
            tagId,
          },
        })
      }
    }
  }

  return {
    setId: studySet.id,
    setName: studySet.name,
    cardCount: cards.length,
  }
}
