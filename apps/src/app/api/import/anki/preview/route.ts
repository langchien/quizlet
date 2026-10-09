import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { previewAnkiPackage } from "@/lib/parsers/anki"

/**
 * POST /api/import/anki/preview — Đọc file .apkg và trả về thông tin cấu trúc, decks, fields và mẫu thẻ để xem trước
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

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "Vui lòng đính kèm file Anki (.apkg)." },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const previews = await previewAnkiPackage(buffer)

    return NextResponse.json({
      success: true,
      filename: file.name,
      decks: previews,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/import/anki/preview:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi đọc file Anki .apkg.",
      },
      { status: 500 }
    )
  }
}
