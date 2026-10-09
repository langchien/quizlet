"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import type { Card } from "@/generated/prisma/client"
import {
  CreateCardSchema,
  UpdateCardSchema,
  ReorderCardsSchema,
  BulkTagCardsSchema,
  type CreateCardBody,
  type UpdateCardBody,
  type ReorderCardsBody,
  type BulkTagCardsBody,
} from "@/schemas/card"
import type { ActionResponse } from "./sets"

/**
 * Server Action: Tạo thẻ học mới
 */
export async function createCardAction(
  input: CreateCardBody
): Promise<ActionResponse<Card>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này." }
    }

    const validation = CreateCardSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Dữ liệu thẻ không hợp lệ.",
      }
    }

    const data = validation.data
    const setId = data.studySetId

    const studySet = await prisma.studySet.findFirst({
      where: { id: setId, userId: user.id },
      include: {
        cards: {
          select: { order: true },
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    })

    if (!studySet) {
      return {
        success: false,
        error: "Bộ thẻ không tồn tại hoặc bạn không có quyền thêm thẻ.",
      }
    }

    const nextOrder =
      data.order > 0
        ? data.order
        : studySet.cards.length > 0
          ? (studySet.cards[0]?.order ?? 0) + 1
          : 0

    const tagIds = data.tagIds || []
    if (tagIds.length > 0) {
      const existingTagsCount = await prisma.tag.count({
        where: {
          id: { in: tagIds },
          userId: user.id,
        },
      })
      if (existingTagsCount !== tagIds.length) {
        return {
          success: false,
          error: "Một hoặc nhiều nhãn (tags) không tồn tại hoặc không thuộc quyền của bạn.",
        }
      }
    }

    const newCard = await prisma.$transaction(async (tx) => {
      const card = await tx.card.create({
        data: {
          studySetId: setId,
          term: data.term,
          reading: data.reading,
          definition: data.definition,
          example: data.example || null,
          exampleTranslation: data.exampleTranslation || null,
          imageUrl: data.imageUrl || null,
          audioUrl: data.audioUrl || null,
          note: data.note || null,
          jlptLevel: data.jlptLevel || null,
          wordType: data.wordType || null,
          radicals: data.radicals || null,
          strokeCount: data.strokeCount || null,
          onReading: data.onReading || null,
          kunReading: data.kunReading || null,
          compounds: data.compounds || null,
          order: nextOrder,
        },
      })

      if (tagIds.length > 0) {
        await tx.cardTag.createMany({
          data: tagIds.map((tagId) => ({
            cardId: card.id,
            tagId,
          })),
        })
      }

      await tx.sRSData.create({
        data: {
          cardId: card.id,
          userId: user.id,
          status: "New",
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
        },
      })

      await tx.studySet.update({
        where: { id: setId },
        data: {
          cardCount: { increment: 1 },
        },
      })

      return card
    })

    revalidatePath(`/sets/${setId}`)
    revalidatePath("/library")
    revalidatePath("/dashboard")

    return { success: true, data: newCard }
  } catch (error) {
    console.error("❌ Lỗi createCardAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi tạo thẻ học." }
  }
}

/**
 * Server Action: Cập nhật thẻ học
 */
export async function updateCardAction(
  cardId: string,
  input: UpdateCardBody
): Promise<ActionResponse<Card>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này." }
    }

    const validation = UpdateCardSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Dữ liệu cập nhật thẻ không hợp lệ.",
      }
    }

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        studySet: { userId: user.id },
      },
      include: { studySet: { select: { id: true } } },
    })

    if (!card) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hoặc bạn không có quyền chỉnh sửa.",
      }
    }

    const data = validation.data
    const tagIds = data.tagIds

    if (tagIds && tagIds.length > 0) {
      const existingTagsCount = await prisma.tag.count({
        where: {
          id: { in: tagIds },
          userId: user.id,
        },
      })
      if (existingTagsCount !== tagIds.length) {
        return {
          success: false,
          error: "Một hoặc nhiều nhãn (tags) không hợp lệ.",
        }
      }
    }

    const updatedCard = await prisma.$transaction(async (tx) => {
      const updated = await tx.card.update({
        where: { id: cardId },
        data: {
          ...(data.term !== undefined && { term: data.term }),
          ...(data.reading !== undefined && { reading: data.reading }),
          ...(data.definition !== undefined && { definition: data.definition }),
          ...(data.example !== undefined && { example: data.example }),
          ...(data.exampleTranslation !== undefined && {
            exampleTranslation: data.exampleTranslation,
          }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
          ...(data.note !== undefined && { note: data.note }),
          ...(data.jlptLevel !== undefined && { jlptLevel: data.jlptLevel }),
          ...(data.wordType !== undefined && { wordType: data.wordType }),
          ...(data.radicals !== undefined && { radicals: data.radicals }),
          ...(data.strokeCount !== undefined && { strokeCount: data.strokeCount }),
          ...(data.onReading !== undefined && { onReading: data.onReading }),
          ...(data.kunReading !== undefined && { kunReading: data.kunReading }),
          ...(data.compounds !== undefined && { compounds: data.compounds }),
          ...(data.order !== undefined && { order: data.order }),
        },
      })

      if (tagIds !== undefined) {
        await tx.cardTag.deleteMany({ where: { cardId } })
        if (tagIds.length > 0) {
          await tx.cardTag.createMany({
            data: tagIds.map((tagId) => ({
              cardId,
              tagId,
            })),
          })
        }
      }

      return updated
    })

    revalidatePath(`/sets/${card.studySetId}`)
    return { success: true, data: updatedCard }
  } catch (error) {
    console.error("❌ Lỗi updateCardAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi cập nhật thẻ." }
  }
}

/**
 * Server Action: Xoá thẻ học
 */
export async function deleteCardAction(
  cardId: string
): Promise<ActionResponse<{ id: string; studySetId: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này." }
    }

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        studySet: { userId: user.id },
      },
      select: { id: true, studySetId: true },
    })

    if (!card) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hoặc bạn không có quyền xoá.",
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.card.delete({ where: { id: cardId } })
      await tx.studySet.update({
        where: { id: card.studySetId },
        data: {
          cardCount: { decrement: 1 },
        },
      })
    })

    revalidatePath(`/sets/${card.studySetId}`)
    revalidatePath("/library")
    revalidatePath("/dashboard")

    return { success: true, data: { id: cardId, studySetId: card.studySetId } }
  } catch (error) {
    console.error("❌ Lỗi deleteCardAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi xoá thẻ." }
  }
}

/**
 * Server Action: Sắp xếp lại thứ tự các thẻ
 */
export async function reorderCardsAction(
  input: ReorderCardsBody
): Promise<ActionResponse<{ count: number }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này." }
    }

    const validation = ReorderCardsSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Dữ liệu sắp xếp không hợp lệ.",
      }
    }

    const { items } = validation.data
    const cardIds = items.map((i) => i.id)

    const existingCards = await prisma.card.findMany({
      where: {
        id: { in: cardIds },
        studySet: { userId: user.id },
      },
      select: { id: true, studySetId: true },
    })

    if (existingCards.length !== cardIds.length) {
      return {
        success: false,
        error: "Một hoặc nhiều thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
      }
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.card.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    const setId = existingCards[0]?.studySetId
    if (setId) {
      revalidatePath(`/sets/${setId}`)
    }

    return { success: true, data: { count: items.length } }
  } catch (error) {
    console.error("❌ Lỗi reorderCardsAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi sắp xếp thứ tự thẻ." }
  }
}

/**
 * Server Action: Gắn hoặc gỡ nhãn hàng loạt cho các thẻ
 */
export async function bulkTagCardsAction(
  input: BulkTagCardsBody
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này." }
    }

    const validation = BulkTagCardsSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Dữ liệu gắn nhãn không hợp lệ.",
      }
    }

    const { cardIds, tagIds, action } = validation.data

    const cards = await prisma.card.findMany({
      where: {
        id: { in: cardIds },
        studySet: { userId: user.id },
      },
      select: { id: true, studySetId: true },
    })

    if (cards.length !== cardIds.length) {
      return {
        success: false,
        error: "Một hoặc nhiều thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
      }
    }

    const tags = await prisma.tag.findMany({
      where: {
        id: { in: tagIds },
        userId: user.id,
      },
      select: { id: true },
    })

    if (tags.length !== tagIds.length) {
      return {
        success: false,
        error: "Một hoặc nhiều nhãn không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
      }
    }

    await prisma.$transaction(async (tx) => {
      if (action === "remove") {
        await tx.cardTag.deleteMany({
          where: {
            cardId: { in: cardIds },
            tagId: { in: tagIds },
          },
        })
      } else {
        for (const cardId of cardIds) {
          for (const tagId of tagIds) {
            await tx.cardTag.upsert({
              where: {
                cardId_tagId: { cardId, tagId },
              },
              create: { cardId, tagId },
              update: {},
            })
          }
        }
      }
    })

    const setId = cards[0]?.studySetId
    if (setId) {
      revalidatePath(`/sets/${setId}`)
    }

    return { success: true, data: { success: true } }
  } catch (error) {
    console.error("❌ Lỗi bulkTagCardsAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi cập nhật nhãn hàng loạt." }
  }
}

/**
 * Server Action: Nhân bản một thẻ học trong cùng bộ thẻ
 */
export async function duplicateCardAction(
  cardId: string
): Promise<ActionResponse<Card>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này." }
    }

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        studySet: { userId: user.id },
      },
      include: {
        cardTags: true,
      },
    })

    if (!card) {
      return {
        success: false,
        error: "Không tìm thấy thẻ cần nhân bản hoặc bạn không có quyền truy cập.",
      }
    }

    const newCard = await prisma.$transaction(async (tx) => {
      const duplicated = await tx.card.create({
        data: {
          studySetId: card.studySetId,
          term: `${card.term} (Bản sao)`,
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
          order: card.order + 1,
        },
      })

      await tx.sRSData.create({
        data: {
          cardId: duplicated.id,
          userId: user.id,
          status: "New",
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
        },
      })

      if (card.cardTags.length > 0) {
        await tx.cardTag.createMany({
          data: card.cardTags.map((ct) => ({
            cardId: duplicated.id,
            tagId: ct.tagId,
          })),
        })
      }

      await tx.studySet.update({
        where: { id: card.studySetId },
        data: { cardCount: { increment: 1 } },
      })

      return duplicated
    })

    revalidatePath(`/sets/${card.studySetId}`)
    return { success: true, data: newCard }
  } catch (error) {
    console.error("❌ Lỗi duplicateCardAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi nhân bản thẻ." }
  }
}

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
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này." }
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
      return { success: false, error: "Vui lòng chọn một tệp hình ảnh hợp lệ để tải lên." }
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Định dạng tệp không được hỗ trợ. Vui lòng tải lên ảnh JPEG, PNG, WebP, GIF hoặc AVIF.",
      }
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return { success: false, error: "Kích thước ảnh vượt quá giới hạn (Tối đa 5MB)." }
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
    return { success: false, error: "Đã xảy ra lỗi khi xử lý và lưu trữ hình ảnh." }
  }
}

