import type { PrismaClient, Folder } from "../../src/generated/prisma/client"

export interface FolderSeedResult {
  minnaFolder: Folder
  n5Folder: Folder
  n4Folder: Folder
  folderMap: Map<string, string>
}

export async function seedFolders(
  prisma: PrismaClient,
  userId: string
): Promise<FolderSeedResult> {
  // Folder gốc: Minna no Nihongo
  let minnaFolder = await prisma.folder.findFirst({
    where: {
      userId,
      name: "Minna no Nihongo (みんなの日本語)",
      parentId: null,
    },
  })
  if (!minnaFolder) {
    minnaFolder = await prisma.folder.create({
      data: {
        name: "Minna no Nihongo (みんなの日本語)",
        description: "Giáo trình tiếng Nhật sơ cấp Minna no Nihongo tiêu chuẩn",
        userId,
        order: 1,
      },
    })
  }

  // Thư mục con: Minna no Nihongo N5 (Bài 1 - 25)
  let n5Folder = await prisma.folder.findFirst({
    where: {
      userId,
      name: "Minna no Nihongo N5 (Bài 1 - 25)",
      parentId: minnaFolder.id,
    },
  })
  if (!n5Folder) {
    n5Folder = await prisma.folder.create({
      data: {
        name: "Minna no Nihongo N5 (Bài 1 - 25)",
        description: "Các bài học từ vựng trình độ N5 căn bản",
        parentId: minnaFolder.id,
        userId,
        order: 1,
      },
    })
  }

  // Thư mục con: Minna no Nihongo N4 (Bài 26 - 50)
  let n4Folder = await prisma.folder.findFirst({
    where: {
      userId,
      name: "Minna no Nihongo N4 (Bài 26 - 50)",
      parentId: minnaFolder.id,
    },
  })
  if (!n4Folder) {
    n4Folder = await prisma.folder.create({
      data: {
        name: "Minna no Nihongo N4 (Bài 26 - 50)",
        description: "Các bài học từ vựng trình độ N4 sơ trung cấp",
        parentId: minnaFolder.id,
        userId,
        order: 2,
      },
    })
  }

  const folderMap = new Map<string, string>()
  folderMap.set(minnaFolder.name, minnaFolder.id)
  folderMap.set(n5Folder.name, n5Folder.id)
  folderMap.set(n4Folder.name, n4Folder.id)

  console.log(
    "✅ [Folders] Đã thiết lập cấu trúc cây thư mục Minna no Nihongo."
  )

  return {
    minnaFolder,
    n5Folder,
    n4Folder,
    folderMap,
  }
}
