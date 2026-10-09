import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { ReorderCardsSchema } from "@/schemas/card"

/**
 * PATCH /api/cards/reorder — Sắp xếp lại thứ tự (order) các thẻ
 */
export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = ReorderCardsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu sắp xếp thẻ không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { items } = validation.data
    const cardIds = items.map((i) => i.id)

    // Kiểm tra tất cả thẻ có thuộc quyền sở hữu của user không
    const existingCards = await prisma.card.findMany({
      where: {
        id: { in: cardIds },
        studySet: { userId: user.id },
      },
      select: { id: true },
    })

    if (existingCards.length !== cardIds.length) {
      return NextResponse.json(
        {
          error:
            "Một hoặc nhiều thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
        },
        { status: 404 }
      )
    }

    // Cập nhật thứ tự từng thẻ trong Transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.card.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật thứ tự cho ${items.length} thẻ thành công.`,
    })
  } catch (error) {
    console.error("❌ Lỗi PATCH /api/cards/reorder:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi sắp xếp thứ tự thẻ." },
      { status: 500 }
    )
  }
}
