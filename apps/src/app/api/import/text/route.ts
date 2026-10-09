import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { parseTextContent } from "@/lib/parsers/text"
import { createImportedStudySet } from "@/lib/import-utils"
import { ImportTextSchema } from "@/schemas/import-export"

/**
 * POST /api/import/text — Import bộ thẻ từ văn bản copy-paste
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
    const validation = ImportTextSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu văn bản không hợp lệ.",
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
      termDefSeparator,
      cardSeparator,
      tags,
    } = validation.data

    const cards = parseTextContent(content, {
      termSeparator: termDefSeparator,
      cardSeparator,
    })

    if (cards.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy thẻ hợp lệ nào trong văn bản nhập vào." },
        { status: 400 }
      )
    }

    const result = await createImportedStudySet({
      userId: user.id,
      setName,
      description: description || null,
      folderId: folderId || null,
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
    console.error("❌ Lỗi POST /api/import/text:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi import văn bản.",
      },
      { status: 500 }
    )
  }
}
