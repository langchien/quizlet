import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { previewText } from "@/lib/parsers/text"

/**
 * POST /api/import/text/preview — Xem trước danh sách thẻ từ văn bản thô
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
    const content = body.content || ""
    const termSeparator = body.termSeparator || undefined
    const cardSeparator = body.cardSeparator || undefined

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Nội dung văn bản không được để trống." },
        { status: 400 }
      )
    }

    const preview = previewText(content, { termSeparator, cardSeparator })

    return NextResponse.json({
      success: true,
      preview,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/import/text/preview:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi xem trước văn bản.",
      },
      { status: 500 }
    )
  }
}
