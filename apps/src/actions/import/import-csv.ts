"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { previewCSV, parseCSVContent } from "@/lib/parsers/csv"
import { createImportedStudySet } from "@/lib/import-utils"
import { ImportCSVSchema } from "@/schemas/import-export"
import type { ActionResponse } from "@/lib/action-client"

/**
 * 1. Xem trước file hoặc văn bản CSV/TSV
 */
export async function previewCSVAction(
  formDataOrInput:
    | FormData
    | {
        content: string
        delimiter?: string
      }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    let content = ""
    let delimiter: string | undefined

    if (formDataOrInput instanceof FormData) {
      const file = formDataOrInput.get("file") as File | null
      delimiter = (formDataOrInput.get("delimiter") as string) || undefined

      if (!file) {
        return {
          success: false,
          error: "Vui lòng chọn file CSV/TSV để xem trước.",
        }
      }
      content = await file.text()
    } else {
      content = formDataOrInput.content || ""
      delimiter = formDataOrInput.delimiter || undefined
    }

    if (!content.trim()) {
      return { success: false, error: "Nội dung CSV không được để trống." }
    }

    const preview = previewCSV(content, delimiter)
    return { success: true, data: preview }
  } catch (error) {
    console.error("❌ Lỗi previewCSVAction:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi phân tích file CSV.",
    }
  }
}

/**
 * 2. Import bộ thẻ từ file hoặc chuỗi CSV/TSV
 */
export async function importCSVAction(
  formDataOrPayload:
    | FormData
    | {
        setName: string
        description?: string
        folderId?: string
        content: string
        delimiter?: string
        hasHeader?: boolean
        columnMapping?: { termIndex: number; definitionIndex: number }
        tags?: string[]
      }
): Promise<
  ActionResponse<{ setId: string; setName: string; cardCount: number }>
> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    let payload: unknown

    if (formDataOrPayload instanceof FormData) {
      const file = formDataOrPayload.get("file") as File | null
      const setName =
        (formDataOrPayload.get("setName") as string) ||
        file?.name?.replace(/\.[^/.]+$/, "") ||
        "CSV Import"
      const description = formDataOrPayload.get("description") as string | null
      const folderId = formDataOrPayload.get("folderId") as string | null
      const delimiter = (formDataOrPayload.get("delimiter") as string) || ","
      const hasHeader = formDataOrPayload.get("hasHeader") === "true"
      const columnMappingRaw = formDataOrPayload.get("columnMapping") as
        string | null
      const tagsRaw = formDataOrPayload.get("tags") as string | null

      let columnMapping = { termIndex: 0, definitionIndex: 1 }
      if (columnMappingRaw) {
        try {
          columnMapping = JSON.parse(columnMappingRaw)
        } catch (e) {
          console.warn("Không thể parse columnMapping JSON:", e)
        }
      }

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

      const content = file ? await file.text() : ""

      payload = {
        setName,
        description,
        folderId,
        content,
        delimiter,
        hasHeader,
        columnMapping,
        tags,
      }
    } else {
      payload = formDataOrPayload
    }

    const validation = ImportCSVSchema.safeParse(payload)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu cấu hình import CSV không hợp lệ.",
      }
    }

    const {
      setName,
      description,
      folderId,
      content,
      delimiter,
      hasHeader,
      columnMapping,
      tags,
    } = validation.data

    const cards = parseCSVContent(content, {
      delimiter,
      hasHeader,
      columnMapping,
    })

    if (cards.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hợp lệ nào trong file CSV.",
      }
    }

    const result = await createImportedStudySet({
      userId: user.id,
      setName,
      description,
      folderId,
      globalTags: tags,
      cards,
    })

    revalidatePath("/library")
    return {
      success: true,
      data: {
        setId: result.setId,
        setName: result.setName,
        cardCount: result.cardCount,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi importCSVAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi import CSV.",
    }
  }
}
