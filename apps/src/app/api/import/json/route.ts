import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { createImportedStudySet } from "@/lib/import-utils"
import { ImportJSONSchema } from "@/schemas/import-export"

/**
 * POST /api/import/json — Import bộ thẻ từ dữ liệu định dạng JSON
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện chức năng này." },
        { status: 401 }
      )
    }

    const body = await req.json()

    // 1. Kiểm tra trường hợp body là danh sách nhiều bộ thẻ
    const rawSets = Array.isArray(body)
      ? body
      : Array.isArray(body.sets)
        ? body.sets
        : [body]

    const importedSets: Array<{
      setId: string
      setName: string
      cardCount: number
    }> = []

    for (const item of rawSets) {
      const validation = ImportJSONSchema.safeParse(item)
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Dữ liệu JSON không hợp lệ.",
            details: validation.error.format(),
          },
          { status: 400 }
        )
      }

      const {
        setName,
        description,
        sourceLanguage,
        targetLanguage,
        folderId,
        tags,
        cards,
      } = validation.data

      const res = await createImportedStudySet({
        userId: user.id,
        setName,
        description: description || null,
        sourceLanguage,
        targetLanguage,
        folderId: folderId || null,
        globalTags: tags,
        cards,
      })

      importedSets.push(res)
    }

    return NextResponse.json({
      success: true,
      importedCount: importedSets.length,
      sets: importedSets,
      setId: importedSets[0]?.setId,
      setName: importedSets[0]?.setName,
      cardCount: importedSets[0]?.cardCount,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/import/json:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi import JSON.",
      },
      { status: 500 }
    )
  }
}
