import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { CreateFolderSchema } from "@/schemas/folder"

export interface FolderNode {
  id: string
  name: string
  description?: string | null
  parentId?: string | null
  userId: string
  order: number
  createdAt: Date
  updatedAt: Date
  children: FolderNode[]
  studySets: Array<{
    id: string
    name: string
    cardCount: number
  }>
}

/**
 * GET /api/folders — Lấy cây thư mục lồng nhau (Tree Structure) của người dùng
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập tài nguyên này." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const flat = searchParams.get("flat") === "true"

    // Lấy tất cả thư mục của người dùng kèm danh sách bộ thẻ thuộc thư mục
    const allFolders = await prisma.folder.findMany({
      where: { userId: user.id },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        studySets: {
          select: {
            id: true,
            name: true,
            cardCount: true,
          },
          orderBy: { name: "asc" },
        },
      },
    })

    if (flat) {
      return NextResponse.json(allFolders)
    }

    // Xây dựng cấu trúc cây (Folder Tree)
    const folderMap = new Map<string, FolderNode>()

    // Khởi tạo map
    allFolders.forEach((f) => {
      folderMap.set(f.id, {
        id: f.id,
        name: f.name,
        description: f.description,
        parentId: f.parentId,
        userId: f.userId,
        order: f.order,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        children: [],
        studySets: f.studySets,
      })
    })

    const rootNodes: FolderNode[] = []

    // Liên kết cha - con
    folderMap.forEach((node) => {
      if (node.parentId && folderMap.has(node.parentId)) {
        const parent = folderMap.get(node.parentId)
        parent?.children.push(node)
      } else {
        rootNodes.push(node)
      }
    })

    return NextResponse.json(rootNodes)
  } catch (error) {
    console.error("❌ Lỗi GET /api/folders:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách thư mục." },
      { status: 500 }
    )
  }
}

/**
 * POST /api/folders — Tạo thư mục mới
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = CreateFolderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu tạo thư mục không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { name, description, parentId, order } = validation.data

    // Kiểm tra parentId nếu có
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, userId: user.id },
      })

      if (!parentFolder) {
        return NextResponse.json(
          {
            error: "Thư mục cha không tồn tại hoặc không thuộc quyền sở hữu.",
          },
          { status: 404 }
        )
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

    return NextResponse.json(
      {
        ...newFolder,
        children: [],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Lỗi POST /api/folders:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi tạo thư mục." },
      { status: 500 }
    )
  }
}
