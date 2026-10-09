import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { BulkTagCardsSchema } from "@/schemas/card"

/**
 * POST /api/cards/bulk-tag — Gán hoặc gỡ nhãn (tags) hàng loạt cho nhiều thẻ
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = BulkTagCardsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu gán nhãn hàng loạt không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { cardIds, tagIds, action } = validation.data

    // Kiểm tra tất cả thẻ có thuộc sở hữu của user không
    const validCards = await prisma.card.findMany({
      where: {
        id: { in: cardIds },
        studySet: { userId: user.id },
      },
      select: { id: true },
    })

    if (validCards.length !== cardIds.length) {
      return NextResponse.json(
        {
          error:
            "Một hoặc nhiều thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
        },
        { status: 404 }
      )
    }

    // Kiểm tra tất cả nhãn (tags) có thuộc sở hữu của user không
    const validTags = await prisma.tag.findMany({
      where: {
        id: { in: tagIds },
        userId: user.id,
      },
      select: { id: true },
    })

    if (validTags.length !== tagIds.length) {
      return NextResponse.json(
        {
          error:
            "Một hoặc nhiều nhãn (tags) không hợp lệ hoặc không thuộc về bạn.",
        },
        { status: 404 }
      )
    }

    if (action === "add") {
      // Chuẩn bị các bản ghi liên kết cần thêm
      const createData: Array<{ cardId: string; tagId: string }> = []
      for (const cardId of cardIds) {
        for (const tagId of tagIds) {
          createData.push({ cardId, tagId })
        }
      }

      await prisma.cardTag.createMany({
        data: createData,
        skipDuplicates: true, // Bỏ qua nếu đã gắn nhãn này trước đó
      })

      return NextResponse.json({
        success: true,
        message: `Đã gắn ${tagIds.length} nhãn cho ${cardIds.length} thẻ thành công.`,
      })
    } else {
      // Gỡ bỏ liên kết nhãn
      await prisma.cardTag.deleteMany({
        where: {
          cardId: { in: cardIds },
          tagId: { in: tagIds },
        },
      })

      return NextResponse.json({
        success: true,
        message: `Đã gỡ bỏ ${tagIds.length} nhãn khỏi ${cardIds.length} thẻ thành công.`,
      })
    }
  } catch (error) {
    console.error("❌ Lỗi POST /api/cards/bulk-tag:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi thao tác nhãn hàng loạt." },
      { status: 500 }
    )
  }
}
