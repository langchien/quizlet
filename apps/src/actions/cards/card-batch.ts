"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import {
  ReorderCardsSchema,
  BulkTagCardsSchema,
  type ReorderCardsBody,
  type BulkTagCardsBody,
} from "@/schemas/card"
import type { ActionResponse } from "@/lib/action-client"

/**
 * Server Action: Sắp xếp lại thứ tự các thẻ
 */
export async function reorderCardsAction(
  input: ReorderCardsBody
): Promise<ActionResponse<{ count: number }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = ReorderCardsSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu sắp xếp không hợp lệ.",
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
        error:
          "Một hoặc nhiều thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
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
    return {
      success: false,
      error: "Đã xảy ra lỗi máy chủ khi sắp xếp thứ tự thẻ.",
    }
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
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = BulkTagCardsSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu gắn nhãn không hợp lệ.",
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
        error:
          "Một hoặc nhiều thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
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
        error:
          "Một hoặc nhiều nhãn không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
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
    return {
      success: false,
      error: "Đã xảy ra lỗi máy chủ khi cập nhật nhãn hàng loạt.",
    }
  }
}
