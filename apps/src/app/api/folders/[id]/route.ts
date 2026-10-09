import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { UpdateFolderSchema } from "@/schemas/folder"

interface RouteProps {
  params: Promise<{ id: string }>
}

/**
 * Kiểm tra xem targetParentId có phải là chính folderId hoặc con cháu của folderId không (tránh vòng lặp vô tận)
 */
async function isDescendantFolder(
  folderId: string,
  targetParentId: string,
  userId: string
): Promise<boolean> {
  if (folderId === targetParentId) return true

  let currentId: string | null = targetParentId
  const visited = new Set<string>()

  while (currentId) {
    if (currentId === folderId) return true
    if (visited.has(currentId)) break
    visited.add(currentId)

    const parentFolder: { parentId: string | null } | null =
      await prisma.folder.findFirst({
        where: { id: currentId, userId },
        select: { parentId: true },
      })

    currentId = parentFolder?.parentId || null
  }

  return false
}

/**
 * GET /api/folders/[id] — Chi tiết thư mục kèm con trực tiếp và bộ thẻ
 */
export async function GET(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập tài nguyên này." },
        { status: 401 }
      )
    }

    const { id } = await params

    const folder = await prisma.folder.findFirst({
      where: { id, userId: user.id },
      include: {
        parent: {
          select: { id: true, name: true },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            order: true,
            _count: {
              select: { studySets: true, children: true },
            },
          },
          orderBy: [{ order: "asc" }, { name: "asc" }],
        },
        studySets: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            cardCount: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: "Không tìm thấy thư mục hoặc bạn không có quyền truy cập." },
        { status: 404 }
      )
    }

    return NextResponse.json(folder)
  } catch (error) {
    console.error("❌ Lỗi GET /api/folders/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy chi tiết thư mục." },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/folders/[id] — Sửa thông tin thư mục
 */
export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const validation = UpdateFolderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu cập nhật thư mục không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingFolder) {
      return NextResponse.json(
        { error: "Không tìm thấy thư mục hoặc bạn không có quyền chỉnh sửa." },
        { status: 404 }
      )
    }

    const { name, description, parentId, order } = validation.data

    // Nếu đổi parentId, kiểm tra tính hợp lệ và tránh vòng lặp
    if (parentId !== undefined && parentId !== null) {
      const isCyclic = await isDescendantFolder(id, parentId, user.id)
      if (isCyclic) {
        return NextResponse.json(
          {
            error:
              "Không thể đặt thư mục cha là chính nó hoặc thư mục con cháu của nó.",
          },
          { status: 400 }
        )
      }

      const parentExists = await prisma.folder.findFirst({
        where: { id: parentId, userId: user.id },
      })
      if (!parentExists) {
        return NextResponse.json(
          { error: "Thư mục cha không tồn tại." },
          { status: 404 }
        )
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error("❌ Lỗi PATCH /api/folders/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi cập nhật thư mục." },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/folders/[id] — Xoá thư mục (các bộ thẻ bên trong tự động tách ra root)
 */
export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingFolder) {
      return NextResponse.json(
        { error: "Không tìm thấy thư mục hoặc bạn không có quyền xoá." },
        { status: 404 }
      )
    }

    // Xoá thư mục (Prisma onDelete: Cascade cho con, SetNull cho studySets)
    await prisma.folder.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Đã xóa thư mục thành công.",
    })
  } catch (error) {
    console.error("❌ Lỗi DELETE /api/folders/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi xóa thư mục." },
      { status: 500 }
    )
  }
}
