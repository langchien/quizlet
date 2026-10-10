"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import type { ActionResponse } from "@/lib/action-client"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]

/**
 * Server Action: Tải lên và tối ưu hoá ảnh minh hoạ cho thẻ (Sharp -> WebP)
 */
export async function uploadCardImageAction(
  cardId: string,
  formData: FormData
): Promise<ActionResponse<{ imageUrl: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        studySet: { userId: user.id },
      },
      select: { id: true, imageUrl: true, studySetId: true },
    })

    if (!card) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hoặc bạn không có quyền cập nhật ảnh.",
      }
    }

    const file = formData.get("file") as File | null
    if (!file || typeof file === "string") {
      return {
        success: false,
        error: "Vui lòng chọn một tệp hình ảnh hợp lệ để tải lên.",
      }
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error:
          "Định dạng tệp không được hỗ trợ. Vui lòng tải lên ảnh JPEG, PNG, WebP, GIF hoặc AVIF.",
      }
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: "Kích thước ảnh vượt quá giới hạn (Tối đa 5MB).",
      }
    }

    const path = await import("path")
    const fs = await import("fs/promises")
    const sharp = (await import("sharp")).default

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "cards")
    await fs.mkdir(uploadsDir, { recursive: true })

    const fileName = `card_${cardId}_${Date.now()}.webp`
    const filePath = path.join(uploadsDir, fileName)

    await sharp(buffer)
      .rotate()
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(filePath)

    const relativeImageUrl = `/uploads/cards/${fileName}`

    if (card.imageUrl && card.imageUrl.startsWith("/uploads/cards/")) {
      const oldFileName = path.basename(card.imageUrl)
      const oldFilePath = path.join(uploadsDir, oldFileName)
      try {
        await fs.unlink(oldFilePath)
      } catch {
        // Bỏ qua lỗi nếu file không tồn tại
      }
    }

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: { imageUrl: relativeImageUrl },
      select: { imageUrl: true },
    })

    revalidatePath(`/sets/${card.studySetId}`)

    return {
      success: true,
      data: { imageUrl: updatedCard.imageUrl as string },
    }
  } catch (error) {
    console.error("❌ Lỗi uploadCardImageAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi xử lý và lưu trữ hình ảnh.",
    }
  }
}
