import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { MoveFolderSchema } from "@/schemas/folder"

interface RouteProps {
  params: Promise<{ id: string }>
}

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
 * PATCH /api/folders/[id]/move — Di chuyển thư mục đến vị trí thư mục cha mới
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
    const validation = MoveFolderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu di chuyển thư mục không hợp lệ.",
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
        { error: "Không tìm thấy thư mục hoặc bạn không có quyền di chuyển." },
        { status: 404 }
      )
    }

    const { parentId } = validation.data

    if (parentId !== null && parentId !== undefined) {
      const isCyclic = await isDescendantFolder(id, parentId, user.id)
      if (isCyclic) {
        return NextResponse.json(
          {
            error:
              "Không thể di chuyển thư mục vào chính nó hoặc thư mục con cháu của nó.",
          },
          { status: 400 }
        )
      }

      const parentExists = await prisma.folder.findFirst({
        where: { id: parentId, userId: user.id },
      })
      if (!parentExists) {
        return NextResponse.json(
          { error: "Thư mục cha chỉ định không tồn tại." },
          { status: 404 }
        )
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error("❌ Lỗi PATCH /api/folders/[id]/move:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi di chuyển thư mục." },
      { status: 500 }
    )
  }
}
