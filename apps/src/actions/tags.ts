"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import {
  getTags,
  getTagById,
  getTagWithCards,
  searchTags,
  type TagWithCount,
} from "@/lib/dal/tags"
import {
  CreateTagSchema,
  UpdateTagSchema,
  type UpdateTagBody,
} from "@/schemas/tag"
import type { z } from "zod"

export type TagActionResult<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Lấy danh sách nhãn của người dùng
 */
export async function getTagsAction(
  search?: string
): Promise<TagActionResult<TagWithCount[]>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const tags = await getTags(user.id, search)
    return { success: true, data: tags }
  } catch (error) {
    console.error("❌ Lỗi getTagsAction:", error)
    return { success: false, error: "Không thể lấy danh sách nhãn." }
  }
}

/**
 * Lấy chi tiết nhãn theo ID
 */
export async function getTagByIdAction(
  id: string
): Promise<TagActionResult<TagWithCount>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const tag = await getTagById(id, user.id)
    if (!tag) {
      return {
        success: false,
        error: "Không tìm thấy nhãn hoặc bạn không có quyền truy cập.",
      }
    }

    return { success: true, data: tag }
  } catch (error) {
    console.error("❌ Lỗi getTagByIdAction:", error)
    return { success: false, error: "Không thể lấy chi tiết nhãn." }
  }
}

/**
 * Lấy chi tiết nhãn kèm tất cả thẻ được gán
 */
export async function getTagCardsAction(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const result = await getTagWithCards(id, user.id)
    if (!result) {
      return {
        success: false,
        error: "Không tìm thấy nhãn hoặc bạn không có quyền truy cập.",
      }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("❌ Lỗi getTagCardsAction:", error)
    return { success: false, error: "Không thể lấy danh sách thẻ theo nhãn." }
  }
}

/**
 * Tìm kiếm nhãn cho autocomplete
 */
export async function searchTagsAction(query: string, limit: number = 10) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const tags = await searchTags(user.id, query, limit)
    return { success: true, data: tags }
  } catch (error) {
    console.error("❌ Lỗi searchTagsAction:", error)
    return { success: false, error: "Không thể tìm kiếm nhãn." }
  }
}

/**
 * Tạo nhãn mới
 */
export async function createTagAction(input: z.input<typeof CreateTagSchema>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const validation = CreateTagSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu nhãn không hợp lệ.",
      }
    }

    const { name, color } = validation.data

    const existing = await prisma.tag.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: "insensitive" },
      },
    })

    if (existing) {
      return {
        success: false,
        error: `Nhãn "${name}" đã tồn tại trong tài khoản của bạn.`,
      }
    }

    const newTag = await prisma.tag.create({
      data: {
        name,
        color: color || "#3B82F6",
        userId: user.id,
      },
    })

    revalidatePath("/tags")
    return {
      success: true,
      data: {
        ...newTag,
        cardCount: 0,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi createTagAction:", error)
    return { success: false, error: "Không thể tạo nhãn mới." }
  }
}

/**
 * Cập nhật nhãn
 */
export async function updateTagAction(id: string, input: UpdateTagBody) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const validation = UpdateTagSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu cập nhật nhãn không hợp lệ.",
      }
    }

    const existingTag = await prisma.tag.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingTag) {
      return {
        success: false,
        error: "Không tìm thấy nhãn hoặc bạn không có quyền chỉnh sửa.",
      }
    }

    const { name, color } = validation.data

    if (name && name.toLowerCase() !== existingTag.name.toLowerCase()) {
      const duplicate = await prisma.tag.findFirst({
        where: {
          userId: user.id,
          name: { equals: name, mode: "insensitive" },
          NOT: { id },
        },
      })

      if (duplicate) {
        return {
          success: false,
          error: `Tên nhãn "${name}" đã được sử dụng.`,
        }
      }
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
      },
      include: {
        _count: {
          select: { cardTags: true },
        },
      },
    })

    revalidatePath("/tags")
    revalidatePath(`/tags/${id}`)
    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        color: updated.color,
        userId: updated.userId,
        cardCount: updated._count.cardTags,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi updateTagAction:", error)
    return { success: false, error: "Không thể cập nhật nhãn." }
  }
}

/**
 * Xóa nhãn
 */
export async function deleteTagAction(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const existingTag = await prisma.tag.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingTag) {
      return {
        success: false,
        error: "Không tìm thấy nhãn hoặc bạn không có quyền xoá.",
      }
    }

    await prisma.tag.delete({
      where: { id },
    })

    revalidatePath("/tags")
    return { success: true, data: { message: "Đã xóa nhãn thành công." } }
  } catch (error) {
    console.error("❌ Lỗi deleteTagAction:", error)
    return { success: false, error: "Không thể xóa nhãn." }
  }
}
