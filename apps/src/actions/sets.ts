"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import type { StudySet } from "@/generated/prisma/client"
import {
  CreateSetSchema,
  UpdateSetSchema,
  MergeSetsSchema,
  type CreateSetBody,
  type UpdateSetBody,
  type DuplicateSetBody,
  type MergeSetsBody,
} from "@/schemas/set"
import { getSets, type GetSetsOptions } from "@/lib/dal/sets"

export type ActionResponse<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Server Action: Tạo mới bộ thẻ học tập
 */
export async function createSetAction(input: CreateSetBody): Promise<
  ActionResponse<
    StudySet & {
      progress: {
        mastered: number
        learning: number
        new: number
        percentage: number
      }
    }
  >
> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = CreateSetSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu tạo bộ thẻ không hợp lệ.",
      }
    }

    const { name, description, sourceLanguage, targetLanguage, folderId } =
      validation.data

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: user.id },
      })
      if (!folder) {
        return {
          success: false,
          error:
            "Thư mục đã chọn không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
        }
      }
    }

    const newSet = await prisma.studySet.create({
      data: {
        name,
        description: description || null,
        sourceLanguage: sourceLanguage || "ja",
        targetLanguage: targetLanguage || "vi",
        folderId: folderId || null,
        userId: user.id,
        cardCount: 0,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    revalidatePath("/library")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: {
        ...newSet,
        progress: {
          mastered: 0,
          learning: 0,
          new: 0,
          percentage: 0,
        },
      },
    }
  } catch (error) {
    console.error("❌ Lỗi createSetAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi tạo bộ thẻ." }
  }
}

/**
 * Server Action: Cập nhật thông tin bộ thẻ
 */
export async function updateSetAction(
  id: string,
  input: UpdateSetBody
): Promise<ActionResponse<StudySet>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = UpdateSetSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu cập nhật bộ thẻ không hợp lệ.",
      }
    }

    const existingSet = await prisma.studySet.findFirst({
      where: { id, userId: user.id },
    })
    if (!existingSet) {
      return {
        success: false,
        error: "Không tìm thấy bộ thẻ hoặc bạn không có quyền chỉnh sửa.",
      }
    }

    const { name, description, sourceLanguage, targetLanguage, folderId } =
      validation.data

    if (folderId !== undefined && folderId !== null) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: user.id },
      })
      if (!folder) {
        return {
          success: false,
          error:
            "Thư mục chỉ định không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
        }
      }
    }

    const updatedSet = await prisma.studySet.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(sourceLanguage !== undefined && { sourceLanguage }),
        ...(targetLanguage !== undefined && { targetLanguage }),
        ...(folderId !== undefined && { folderId }),
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    revalidatePath(`/sets/${id}`)
    revalidatePath("/library")
    revalidatePath("/dashboard")

    return { success: true, data: updatedSet }
  } catch (error) {
    console.error("❌ Lỗi updateSetAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi máy chủ khi cập nhật bộ thẻ.",
    }
  }
}

/**
 * Server Action: Xoá bộ thẻ
 */
export async function deleteSetAction(
  id: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const existingSet = await prisma.studySet.findFirst({
      where: { id, userId: user.id },
    })
    if (!existingSet) {
      return {
        success: false,
        error: "Không tìm thấy bộ thẻ hoặc bạn không có quyền xoá.",
      }
    }

    await prisma.studySet.delete({
      where: { id },
    })

    revalidatePath("/library")
    revalidatePath("/dashboard")

    return { success: true, data: { id } }
  } catch (error) {
    console.error("❌ Lỗi deleteSetAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi xoá bộ thẻ." }
  }
}

/**
 * Server Action: Nhân bản bộ thẻ
 */
export async function duplicateSetAction(
  id: string,
  input?: DuplicateSetBody
): Promise<ActionResponse<StudySet>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const originalSet = await prisma.studySet.findFirst({
      where: { id, userId: user.id },
      include: {
        cards: {
          include: {
            cardTags: true,
          },
        },
      },
    })

    if (!originalSet) {
      return {
        success: false,
        error:
          "Không tìm thấy bộ thẻ cần nhân bản hoặc bạn không có quyền truy cập.",
      }
    }

    const targetName = input?.name?.trim() || `${originalSet.name} (Bản sao)`

    const duplicatedSet = await prisma.$transaction(async (tx) => {
      const newSet = await tx.studySet.create({
        data: {
          name: targetName,
          description: originalSet.description,
          sourceLanguage: originalSet.sourceLanguage,
          targetLanguage: originalSet.targetLanguage,
          folderId: originalSet.folderId,
          userId: user.id,
          cardCount: originalSet.cards.length,
        },
      })

      for (const card of originalSet.cards) {
        const newCard = await tx.card.create({
          data: {
            studySetId: newSet.id,
            term: card.term,
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
            order: card.order,
          },
        })

        // Tạo SRS ban đầu cho thẻ nhân bản
        await tx.sRSData.create({
          data: {
            cardId: newCard.id,
            userId: user.id,
            status: "New",
            interval: 0,
            repetitions: 0,
            easeFactor: 2.5,
          },
        })

        // Gán lại tags
        if (card.cardTags.length > 0) {
          await tx.cardTag.createMany({
            data: card.cardTags.map((ct) => ({
              cardId: newCard.id,
              tagId: ct.tagId,
            })),
          })
        }
      }

      return newSet
    })

    revalidatePath("/library")
    revalidatePath("/dashboard")

    return { success: true, data: duplicatedSet }
  } catch (error) {
    console.error("❌ Lỗi duplicateSetAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi máy chủ khi nhân bản bộ thẻ.",
    }
  }
}

/**
 * Server Action: Gộp nhiều bộ thẻ nguồn vào một bộ thẻ đích
 */
export async function mergeSetsAction(
  input: MergeSetsBody
): Promise<ActionResponse<{ mergedCardsCount: number }>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = MergeSetsSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu gộp bộ thẻ không hợp lệ.",
      }
    }

    const { targetSetId, sourceSetIds, deleteSources } = validation.data

    if (sourceSetIds.includes(targetSetId)) {
      return {
        success: false,
        error:
          "Bộ thẻ đích không được nằm trong danh sách các bộ thẻ nguồn cần gộp.",
      }
    }

    const targetSet = await prisma.studySet.findFirst({
      where: { id: targetSetId, userId: user.id },
      include: {
        cards: {
          select: { order: true },
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    })

    if (!targetSet) {
      return {
        success: false,
        error: "Bộ thẻ đích không tồn tại hoặc bạn không có quyền truy cập.",
      }
    }

    let currentOrder =
      targetSet.cards.length > 0 ? (targetSet.cards[0]?.order ?? 0) + 1 : 0

    const sourceSets = await prisma.studySet.findMany({
      where: {
        id: { in: sourceSetIds },
        userId: user.id,
      },
      include: {
        cards: {
          include: { cardTags: true },
        },
      },
    })

    if (sourceSets.length !== sourceSetIds.length) {
      return {
        success: false,
        error:
          "Một hoặc nhiều bộ thẻ nguồn không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let mergedCardsCount = 0

      for (const sourceSet of sourceSets) {
        for (const card of sourceSet.cards) {
          const newCard = await tx.card.create({
            data: {
              studySetId: targetSetId,
              term: card.term,
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
              order: currentOrder++,
            },
          })

          await tx.sRSData.create({
            data: {
              cardId: newCard.id,
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
                cardId: newCard.id,
                tagId: ct.tagId,
              })),
            })
          }

          mergedCardsCount++
        }
      }

      await tx.studySet.update({
        where: { id: targetSetId },
        data: {
          cardCount: { increment: mergedCardsCount },
        },
      })

      if (deleteSources) {
        await tx.studySet.deleteMany({
          where: { id: { in: sourceSetIds }, userId: user.id },
        })
      }

      return { mergedCardsCount }
    })

    revalidatePath(`/sets/${targetSetId}`)
    revalidatePath("/library")
    revalidatePath("/dashboard")

    return { success: true, data: result }
  } catch (error) {
    console.error("❌ Lỗi mergeSetsAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi gộp bộ thẻ." }
  }
}

/**
 * Server Action: Lấy danh sách bộ thẻ kèm phân trang và tìm kiếm
 */
export async function getUserSetsAction(
  options: Omit<GetSetsOptions, "userId"> = {}
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để xem danh sách bộ thẻ.",
      }
    }

    const data = await getSets({ ...options, userId: user.id })
    return { success: true, data }
  } catch (error) {
    console.error("❌ Lỗi getUserSetsAction:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tải danh sách bộ thẻ." }
  }
}
