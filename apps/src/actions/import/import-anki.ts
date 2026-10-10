"use server"

import path from "path"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { previewAnkiPackage, parseFullAnkiPackage } from "@/lib/parsers/anki"
import { createImportedStudySet } from "@/lib/import-utils"
import type { AnkiFieldMapping } from "@/schemas/import-export"
import type { ActionResponse } from "@/lib/action-client"

/**
 * 5. Xem trước gói Anki (.apkg)
 */
export async function previewAnkiAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const file = formData.get("file") as File | null
    if (!file) {
      return {
        success: false,
        error: "Vui lòng đính kèm file Anki (.apkg).",
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const previews = await previewAnkiPackage(buffer)

    return {
      success: true,
      data: {
        filename: file.name,
        decks: previews,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi previewAnkiAction:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi đọc file Anki .apkg.",
    }
  }
}

/**
 * 6. Import bộ thẻ từ gói Anki (.apkg)
 */
export async function importAnkiAction(formData: FormData): Promise<
  ActionResponse<{
    setId: string
    setName: string
    cardCount: number
    extractedMediaCount: number
  }>
> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const file = formData.get("file") as File | null
    if (!file) {
      return {
        success: false,
        error: "Vui lòng đính kèm file Anki (.apkg).",
      }
    }

    const setNameInput = formData.get("setName") as string | null
    const description = formData.get("description") as string | null
    const folderId = formData.get("folderId") as string | null
    const deckId = formData.get("deckId") as string | null
    const tagsRaw = formData.get("tags") as string | null
    const fieldMappingRaw = formData.get("fieldMapping") as string | null

    let tags: string[] = []
    if (tagsRaw) {
      try {
        tags = JSON.parse(tagsRaw)
      } catch {
        tags = tagsRaw
          .split(/[,;\s]+/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      }
    }

    let fieldMapping: AnkiFieldMapping | undefined
    if (fieldMappingRaw) {
      try {
        fieldMapping = JSON.parse(fieldMappingRaw)
      } catch (e) {
        console.warn("Không thể parse fieldMapping JSON:", e)
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mediaTargetDir = path.join(process.cwd(), "public", "uploads", "anki")

    const parsed = await parseFullAnkiPackage(buffer, {
      deckId: deckId || undefined,
      fieldMapping,
      mediaTargetDir,
    })

    if (parsed.cards.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hợp lệ nào trong bộ thẻ Anki đã chọn.",
      }
    }

    const finalSetName =
      setNameInput?.trim() || parsed.deckName || "Anki Import"

    const result = await createImportedStudySet({
      userId: user.id,
      setName: finalSetName,
      description: description || null,
      folderId: folderId || null,
      globalTags: tags,
      cards: parsed.cards,
    })

    revalidatePath("/library")
    return {
      success: true,
      data: {
        setId: result.setId,
        setName: result.setName,
        cardCount: result.cardCount,
        extractedMediaCount: parsed.extractedMediaCount,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi importAnkiAction:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Lỗi máy chủ khi import file Anki.",
    }
  }
}
