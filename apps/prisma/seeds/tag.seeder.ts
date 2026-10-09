import type { PrismaClient } from "../../src/generated/prisma/client"
import { getTagColor, type RawStudySetData } from "./types"

export async function seedTagsFromSets(
  prisma: PrismaClient,
  userId: string,
  rawSetList: RawStudySetData[]
): Promise<Map<string, string>> {
  const uniqueTagsSet = new Set<string>()

  for (const set of rawSetList) {
    for (const card of set.studySet.cards) {
      if (Array.isArray(card.tags)) {
        for (const t of card.tags) {
          const trimmed = t.trim()
          if (trimmed) uniqueTagsSet.add(trimmed)
        }
      }
    }
  }

  const tagMap = new Map<string, string>()
  let tagIndex = 0

  for (const tagName of uniqueTagsSet) {
    const color = getTagColor(tagName, tagIndex++)
    const tag = await prisma.tag.upsert({
      where: { name_userId: { name: tagName, userId } },
      update: { color },
      create: { name: tagName, color, userId },
    })
    tagMap.set(tagName, tag.id)
  }

  console.log(
    `✅ [Tags] Đã khởi tạo/cập nhật ${tagMap.size} nhãn phân loại từ dữ liệu thẻ.`
  )

  return tagMap
}
