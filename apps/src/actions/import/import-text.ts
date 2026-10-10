"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { previewText, parseTextContent } from "@/lib/parsers/text"
import { createImportedStudySet } from "@/lib/import-utils"
import { ImportTextSchema } from "@/schemas/import-export"
import type { ActionResponse } from "@/lib/action-client"

/**
 * 3. Xem trước văn bản phân cách
 */
export async function previewTextAction(params: {
  content: string
  termSeparator?: string
  cardSeparator?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const { content, termSeparator, cardSeparator } = params
    if (!content || !content.trim()) {
      return { success: false, error: "Nội dung văn bản không được để trống." }
    }

    const preview = previewText(content, { termSeparator, cardSeparator })
    return { success: true, data: preview }
  } catch (error) {
    console.error("❌ Lỗi previewTextAction:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Lỗi khi phân tích văn bản xem trước.",
    }
  }
}

/**
 * 4. Import bộ thẻ từ văn bản
 */
export async function importTextAction(
  payload: unknown
): Promise<
  ActionResponse<{ setId: string; setName: string; cardCount: number }>
> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const validation = ImportTextSchema.safeParse(payload)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu văn bản không hợp lệ.",
      }
    }

    const {
      setName,
      description,
      folderId,
      content,
      termDefSeparator,
      cardSeparator,
      tags,
    } = validation.data

    const cards = parseTextContent(content, {
      termSeparator: termDefSeparator,
      cardSeparator,
    })

    if (cards.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hợp lệ nào trong văn bản nhập vào.",
      }
    }

    const result = await createImportedStudySet({
      userId: user.id,
      setName,
      description: description || null,
      folderId: folderId || null,
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
    console.error("❌ Lỗi importTextAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi import văn bản.",
    }
  }
}
