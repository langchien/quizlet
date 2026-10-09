import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { previewCSV } from "@/lib/parsers/csv"

/**
 * POST /api/import/csv/preview — Xem trước cấu trúc và dữ liệu file CSV/TSV
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
    let content = ""
    let delimiter: string | undefined

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null
      delimiter = (formData.get("delimiter") as string) || undefined

      if (!file) {
        return NextResponse.json(
          { error: "Vui lòng chọn file CSV/TSV để xem trước." },
          { status: 400 }
        )
      }

      content = await file.text()
    } else {
      const body = await req.json()
      content = body.content || ""
      delimiter = body.delimiter || undefined
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Nội dung CSV không được để trống." },
        { status: 400 }
      )
    }

    const preview = previewCSV(content, delimiter)

    return NextResponse.json({
      success: true,
      preview,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/import/csv/preview:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi xem trước CSV.",
      },
      { status: 500 }
    )
  }
}
