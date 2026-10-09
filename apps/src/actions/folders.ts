"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import {
  getFoldersTree,
  getFoldersFlat,
  getFolderById,
  isDescendantFolder,
  type FolderNode,
} from "@/lib/dal/folders"
import {
  CreateFolderSchema,
  UpdateFolderSchema,
  MoveFolderSchema,
  type UpdateFolderBody,
  type MoveFolderBody,
} from "@/schemas/folder"
import type { z } from "zod"

export type FolderActionResult<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Lấy cây thư mục (Tree Structure) của người dùng
 */
export async function getFoldersTreeAction(): Promise<
  FolderActionResult<FolderNode[]>
> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const tree = await getFoldersTree(user.id)
    return { success: true, data: tree }
  } catch (error) {
    console.error("❌ Lỗi getFoldersTreeAction:", error)
    return { success: false, error: "Không thể lấy danh sách thư mục." }
  }
}

/**
 * Lấy danh sách phẳng (Flat list) tất cả thư mục của người dùng
 */
export async function getFoldersFlatAction() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const flat = await getFoldersFlat(user.id)
    return { success: true, data: flat }
  } catch (error) {
    console.error("❌ Lỗi getFoldersFlatAction:", error)
    return { success: false, error: "Không thể lấy danh sách thư mục." }
  }
}

/**
 * Lấy chi tiết thư mục theo ID
 */
export async function getFolderByIdAction(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const folder = await getFolderById(id, user.id)
    if (!folder) {
      return {
        success: false,
        error: "Không tìm thấy thư mục hoặc bạn không có quyền truy cập.",
      }
    }

    return { success: true, data: folder }
  } catch (error) {
    console.error("❌ Lỗi getFolderByIdAction:", error)
    return { success: false, error: "Không thể lấy chi tiết thư mục." }
  }
}

/**
 * Tạo thư mục mới
 */
export async function createFolderAction(
  input: z.input<typeof CreateFolderSchema>
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const validation = CreateFolderSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu tạo thư mục không hợp lệ.",
      }
    }

    const { name, description, parentId, order } = validation.data

    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, userId: user.id },
      })
      if (!parentFolder) {
        return {
          success: false,
          error: "Thư mục cha không tồn tại hoặc không thuộc quyền sở hữu.",
        }
      }
    }

    const newFolder = await prisma.folder.create({
      data: {
        name,
        description: description || null,
        parentId: parentId || null,
        order: order ?? 0,
        userId: user.id,
      },
      include: {
        studySets: {
          select: {
            id: true,
            name: true,
            cardCount: true,
          },
        },
      },
    })

    revalidatePath("/library")
    return {
      success: true,
      data: {
        ...newFolder,
        children: [],
      },
    }
  } catch (error) {
    console.error("❌ Lỗi createFolderAction:", error)
    return { success: false, error: "Không thể tạo thư mục." }
  }
}

/**
 * Cập nhật thông tin thư mục
 */
export async function updateFolderAction(id: string, input: UpdateFolderBody) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const validation = UpdateFolderSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu cập nhật thư mục không hợp lệ.",
      }
    }

    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingFolder) {
      return {
        success: false,
        error: "Không tìm thấy thư mục hoặc bạn không có quyền chỉnh sửa.",
      }
    }

    const { name, description, parentId, order } = validation.data

    if (parentId !== undefined && parentId !== null) {
      const isCyclic = await isDescendantFolder(id, parentId, user.id)
      if (isCyclic) {
        return {
          success: false,
          error:
            "Không thể đặt thư mục cha là chính nó hoặc thư mục con cháu của nó.",
        }
      }

      const parentExists = await prisma.folder.findFirst({
        where: { id: parentId, userId: user.id },
      })
      if (!parentExists) {
        return { success: false, error: "Thư mục cha không tồn tại." }
      }
    }

    const updated = await prisma.folder.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId }),
        ...(order !== undefined && { order }),
      },
      include: {
        parent: { select: { id: true, name: true } },
        studySets: {
          select: { id: true, name: true, cardCount: true },
        },
      },
    })

    revalidatePath("/library")
    return { success: true, data: updated }
  } catch (error) {
    console.error("❌ Lỗi updateFolderAction:", error)
    return { success: false, error: "Không thể cập nhật thư mục." }
  }
}

/**
 * Xóa thư mục
 */
export async function deleteFolderAction(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingFolder) {
      return {
        success: false,
        error: "Không tìm thấy thư mục hoặc bạn không có quyền xoá.",
      }
    }

    await prisma.folder.delete({
      where: { id },
    })

    revalidatePath("/library")
    return { success: true, data: { message: "Đã xóa thư mục thành công." } }
  } catch (error) {
    console.error("❌ Lỗi deleteFolderAction:", error)
    return { success: false, error: "Không thể xóa thư mục." }
  }
}

/**
 * Di chuyển thư mục
 */
export async function moveFolderAction(id: string, input: MoveFolderBody) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const validation = MoveFolderSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu di chuyển thư mục không hợp lệ.",
      }
    }

    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingFolder) {
      return {
        success: false,
        error: "Không tìm thấy thư mục hoặc bạn không có quyền di chuyển.",
      }
    }

    const { parentId } = validation.data

    if (parentId !== null && parentId !== undefined) {
      const isCyclic = await isDescendantFolder(id, parentId, user.id)
      if (isCyclic) {
        return {
          success: false,
          error:
            "Không thể di chuyển thư mục vào chính nó hoặc thư mục con cháu của nó.",
        }
      }

      const parentExists = await prisma.folder.findFirst({
        where: { id: parentId, userId: user.id },
      })
      if (!parentExists) {
        return { success: false, error: "Thư mục cha chỉ định không tồn tại." }
      }
    }

    const updated = await prisma.folder.update({
      where: { id },
      data: {
        parentId: parentId || null,
      },
      include: {
        parent: {
          select: { id: true, name: true },
        },
        studySets: {
          select: { id: true, name: true, cardCount: true },
        },
      },
    })

    revalidatePath("/library")
    return { success: true, data: updated }
  } catch (error) {
    console.error("❌ Lỗi moveFolderAction:", error)
    return { success: false, error: "Không thể di chuyển thư mục." }
  }
}
