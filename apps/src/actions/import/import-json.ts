"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { createImportedStudySet } from "@/lib/import-utils"
import { ImportJSONSchema } from "@/schemas/import-export"
import type { ActionResponse } from "@/lib/action-client"

/**
 * 7. Import bộ thẻ từ cấu trúc JSON
 */
export async function importJSONAction(rawInput: unknown): Promise<
  ActionResponse<{
    importedCount: number
    sets: Array<{ setId: string; setName: string; cardCount: number }>
    setId?: string
    setName?: string
    cardCount?: number
  }>
> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const rawSets = Array.isArray(rawInput)
      ? rawInput
      : typeof rawInput === "object" &&
          rawInput !== null &&
          "studySets" in rawInput &&
          Array.isArray((rawInput as { studySets: unknown[] }).studySets)
        ? (rawInput as { studySets: unknown[] }).studySets
        : typeof rawInput === "object" &&
            rawInput !== null &&
            "sets" in rawInput &&
            Array.isArray((rawInput as { sets: unknown[] }).sets)
          ? (rawInput as { sets: unknown[] }).sets
          : [rawInput]

    const importedSets: Array<{
      setId: string
      setName: string
      cardCount: number
    }> = []

    for (const item of rawSets) {
      const validation = ImportJSONSchema.safeParse(item)
      if (!validation.success) {
        return {
          success: false,
          error: "Dữ liệu JSON không hợp lệ.",
        }
      }

      const {
        setName,
        description,
        sourceLanguage,
        targetLanguage,
        folderId,
        tags,
        cards,
      } = validation.data

      const res = await createImportedStudySet({
        userId: user.id,
        setName,
        description: description || null,
        sourceLanguage,
        targetLanguage,
        folderId: folderId || null,
        globalTags: tags,
        cards,
      })

      importedSets.push(res)
    }

    revalidatePath("/library")
    return {
      success: true,
      data: {
        importedCount: importedSets.length,
        sets: importedSets,
        setId: importedSets[0]?.setId,
        setName: importedSets[0]?.setName,
        cardCount: importedSets[0]?.cardCount,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi importJSONAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi import JSON.",
    }
  }
}
