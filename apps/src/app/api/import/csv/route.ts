import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { parseCSVContent } from "@/lib/parsers/csv"
import { createImportedStudySet } from "@/lib/import-utils"
import { ImportCSVSchema } from "@/schemas/import-export"

/**
 * POST /api/import/csv — Import bộ thẻ từ file CSV / TSV theo mapping đã chọn
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

    const contentType = req.headers.get("content-type") || ""
    let payload: unknown

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null
      const setName =
        (formData.get("setName") as string) ||
        file?.name?.replace(/\.[^/.]+$/, "") ||
        "CSV Import"
      const description = formData.get("description") as string | null
      const folderId = formData.get("folderId") as string | null
      const delimiter = (formData.get("delimiter") as string) || ","
      const hasHeader = formData.get("hasHeader") === "true"
      const columnMappingRaw = formData.get("columnMapping") as string | null
      const tagsRaw = formData.get("tags") as string | null

      let columnMapping = { termIndex: 0, definitionIndex: 1 }
      if (columnMappingRaw) {
        try {
          columnMapping = JSON.parse(columnMappingRaw)
        } catch (e) {
          console.warn("Không thể parse columnMapping JSON:", e)
        }
      }

      let tags: string[] = []
      if (tagsRaw) {
        try {
          tags = JSON.parse(tagsRaw)
        } catch {
          tags = tagsRaw
            .split(/[,;\s]+/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        }
      }

      const content = file ? await file.text() : ""

      payload = {
        setName,
        description,
        folderId,
        content,
        delimiter,
        hasHeader,
        columnMapping,
        tags,
      }
    } else {
      payload = await req.json()
    }

    const validation = ImportCSVSchema.safeParse(payload)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu cấu hình import CSV không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const {
      setName,
      description,
      folderId,
      content,
      delimiter,
      hasHeader,
      columnMapping,
      tags,
    } = validation.data

    const cards = parseCSVContent(content, {
      delimiter,
      hasHeader,
      columnMapping,
    })

    if (cards.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy thẻ hợp lệ nào trong file CSV." },
        { status: 400 }
      )
    }

    const result = await createImportedStudySet({
      userId: user.id,
      setName,
      description,
      folderId,
      globalTags: tags,
      cards,
    })

    return NextResponse.json({
      success: true,
      setId: result.setId,
      setName: result.setName,
      cardCount: result.cardCount,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/import/csv:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi import CSV.",
      },
      { status: 500 }
    )
  }
}
