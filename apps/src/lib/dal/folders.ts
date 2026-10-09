import { prisma } from "@/lib/prisma"

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
 * Lấy cây thư mục lồng nhau (Tree Structure) của người dùng
 */
export async function getFoldersTree(userId: string): Promise<FolderNode[]> {
  const allFolders = await prisma.folder.findMany({
    where: { userId },
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

  const folderMap = new Map<string, FolderNode>()

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

  folderMap.forEach((node) => {
    if (node.parentId && folderMap.has(node.parentId)) {
      const parent = folderMap.get(node.parentId)
      parent?.children.push(node)
    } else {
      rootNodes.push(node)
    }
  })

  return rootNodes
}

/**
 * Lấy danh sách phẳng (Flat list) tất cả thư mục của người dùng
 */
export async function getFoldersFlat(userId: string) {
  return prisma.folder.findMany({
    where: { userId },
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
}

/**
 * Lấy chi tiết thư mục theo ID kèm thư mục con trực tiếp và các bộ thẻ
 */
export async function getFolderById(id: string, userId: string) {
  return prisma.folder.findFirst({
    where: { id, userId },
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
}

/**
 * Kiểm tra xem targetParentId có phải là chính folderId hoặc con cháu của folderId không (tránh vòng lặp)
 */
export async function isDescendantFolder(
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
