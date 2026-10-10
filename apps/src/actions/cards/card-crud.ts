"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import type { Card } from "@/generated/prisma/client"
import {
  CreateCardSchema,
  UpdateCardSchema,
  type CreateCardBody,
  type UpdateCardBody,
} from "@/schemas/card"
import type { ActionResponse } from "@/lib/action-client"

/**
 * Server Action: Tạo thẻ học mới
 */
export async function createCardAction(
  input: CreateCardBody
): Promise<ActionResponse<Card>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = CreateCardSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message || "Dữ liệu thẻ không hợp lệ.",
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
          error:
            "Một hoặc nhiều nhãn (tags) không tồn tại hoặc không thuộc quyền của bạn.",
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
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = UpdateCardSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu cập nhật thẻ không hợp lệ.",
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
          ...(data.strokeCount !== undefined && {
            strokeCount: data.strokeCount,
          }),
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
 * Server Action: Nhân bản một thẻ học trong cùng bộ thẻ
 */
export async function duplicateCardAction(
  cardId: string
): Promise<ActionResponse<Card>> {
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
      include: {
        cardTags: true,
      },
    })

    if (!card) {
      return {
        success: false,
        error:
          "Không tìm thấy thẻ cần nhân bản hoặc bạn không có quyền truy cập.",
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
