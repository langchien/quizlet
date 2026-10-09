import { NextResponse } from "next/server"
import path from "path"
import { getAuthUser } from "@/lib/auth"
import { parseFullAnkiPackage } from "@/lib/parsers/anki"
import { createImportedStudySet } from "@/lib/import-utils"
import type { AnkiFieldMapping } from "@/schemas/import-export"

/**
 * POST /api/import/anki — Import toàn bộ bộ thẻ từ file Anki .apkg
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

    const setNameInput = formData.get("setName") as string | null
    const description = formData.get("description") as string | null
    const folderId = formData.get("folderId") as string | null
    const deckId = formData.get("deckId") as string | null
    const tagsRaw = formData.get("tags") as string | null
    const fieldMappingRaw = formData.get("fieldMapping") as string | null

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

    let fieldMapping: AnkiFieldMapping | undefined
    if (fieldMappingRaw) {
      try {
        fieldMapping = JSON.parse(fieldMappingRaw)
      } catch (e) {
        console.warn("Không thể parse fieldMapping JSON:", e)
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mediaTargetDir = path.join(process.cwd(), "public", "uploads", "anki")

    // Parse file Anki
    const parsed = await parseFullAnkiPackage(buffer, {
      deckId: deckId || undefined,
      fieldMapping,
      mediaTargetDir,
    })

    if (parsed.cards.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy thẻ hợp lệ nào trong bộ thẻ Anki đã chọn." },
        { status: 400 }
      )
    }

    const finalSetName =
      setNameInput?.trim() || parsed.deckName || "Anki Import"

    // Lưu vào database
    const result = await createImportedStudySet({
      userId: user.id,
      setName: finalSetName,
      description: description || null,
      folderId: folderId || null,
      globalTags: tags,
      cards: parsed.cards,
    })

    return NextResponse.json({
      success: true,
      setId: result.setId,
      setName: result.setName,
      cardCount: result.cardCount,
      extractedMediaCount: parsed.extractedMediaCount,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/import/anki:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi máy chủ khi import file Anki.",
      },
      { status: 500 }
    )
  }
}
