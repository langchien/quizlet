import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

/**
 * GET /api/export/set/[id] — Xuất dữ liệu của một bộ thẻ ra JSON hoặc CSV
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện chức năng này." },
        { status: 401 }
      )
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "json"

    const studySet = await prisma.studySet.findFirst({
      where: { id, userId: user.id },
      include: {
        folder: {
          select: { id: true, name: true },
        },
        cards: {
          orderBy: { order: "asc" },
          include: {
            cardTags: {
              include: { tag: true },
            },
            srsData: {
              where: { userId: user.id },
            },
          },
        },
      },
    })

    if (!studySet) {
      return NextResponse.json(
        { error: "Bộ thẻ không tồn tại hoặc bạn không có quyền truy cập." },
        { status: 404 }
      )
    }

    // Loại bỏ các ký tự không hợp lệ trên tên file hệ điều hành
    const sanitizedTitle =
      studySet.name.replace(/[\\/:*?"<>|]/g, "_").trim() || "study-set"

    // Tạo fallback ASCII an toàn (bỏ dấu tiếng Việt và ký tự ngoài ASCII) để header HTTP không bị lỗi ByteString
    const asciiFallback =
      sanitizedTitle
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "") || "study-set"

    // Tạo header Content-Disposition tuân thủ RFC 5987 / RFC 6266
    const getContentDisposition = (ext: "csv" | "json") => {
      const fallback = `${asciiFallback}.${ext}`
      const encoded = encodeURIComponent(`${sanitizedTitle}.${ext}`)
      return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`
    }

    // 1. Xuất định dạng CSV
    if (format === "csv") {
      const escapeCSV = (val?: string | null) => {
        if (!val) return '""'
        const escaped = val.replace(/"/g, '""')
        return `"${escaped}"`
      }

      const headers = [
        "Term",
        "Reading",
        "Definition",
        "Example",
        "ExampleTranslation",
        "Note",
        "JLPTLevel",
        "WordType",
        "Tags",
      ].join(",")

      const rows = studySet.cards.map((c) => {
        const tagNames = c.cardTags.map((ct) => ct.tag.name).join("; ")
        return [
          escapeCSV(c.term),
          escapeCSV(c.reading),
          escapeCSV(c.definition),
          escapeCSV(c.example),
          escapeCSV(c.exampleTranslation),
          escapeCSV(c.note),
          escapeCSV(c.jlptLevel),
          escapeCSV(c.wordType),
          escapeCSV(tagNames),
        ].join(",")
      })

      const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n") // \uFEFF UTF-8 BOM

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": getContentDisposition("csv"),
        },
      })
    }

    // 2. Xuất định dạng JSON chuẩn NihoMemo
    const exportData = {
      app: "NihoMemo",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      studySet: {
        id: studySet.id,
        name: studySet.name,
        description: studySet.description,
        sourceLanguage: studySet.sourceLanguage,
        targetLanguage: studySet.targetLanguage,
        folderName: studySet.folder?.name || null,
        cardCount: studySet.cardCount,
        cards: studySet.cards.map((c) => ({
          term: c.term,
          reading: c.reading,
          definition: c.definition,
          example: c.example,
          exampleTranslation: c.exampleTranslation,
          imageUrl: c.imageUrl,
          audioUrl: c.audioUrl,
          note: c.note,
          jlptLevel: c.jlptLevel,
          wordType: c.wordType,
          radicals: c.radicals,
          strokeCount: c.strokeCount,
          onReading: c.onReading,
          kunReading: c.kunReading,
          compounds: c.compounds,
          order: c.order,
          tags: c.cardTags.map((ct) => ct.tag.name),
          srsStatus: c.srsData[0]?.status || "New",
        })),
      },
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": getContentDisposition("json"),
      },
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/export/set/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xuất dữ liệu bộ thẻ." },
      { status: 500 }
    )
  }
}
