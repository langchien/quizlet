import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { UpdateCardSchema } from "@/schemas/card"

interface RouteProps {
  params: Promise<{ id: string }>
}

/**
 * GET /api/cards/[id] — Lấy chi tiết một thẻ học
 */
export async function GET(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params

    const card = await prisma.card.findFirst({
      where: {
        id,
        studySet: { userId: user.id },
      },
      include: {
        cardTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        srsData: {
          where: { userId: user.id },
          take: 1,
        },
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: "Không tìm thấy thẻ hoặc bạn không có quyền truy cập." },
        { status: 404 }
      )
    }

    const formattedCard = {
      id: card.id,
      studySetId: card.studySetId,
      term: card.term,
      reading: card.reading,
      definition: card.definition,
      example: card.example,
      exampleTranslation: card.exampleTranslation,
      imageUrl: card.imageUrl,
      audioUrl: card.audioUrl,
      note: card.note,
      jlptLevel: card.jlptLevel,
      wordType: card.wordType,
      radicals: card.radicals,
      strokeCount: card.strokeCount,
      onReading: card.onReading,
      kunReading: card.kunReading,
      compounds: card.compounds,
      order: card.order,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      tags: card.cardTags.map((ct) => ct.tag),
      srsData: card.srsData[0] || null,
    }

    return NextResponse.json(formattedCard)
  } catch (error) {
    console.error("❌ Lỗi GET /api/cards/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy chi tiết thẻ." },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/cards/[id] — Chỉnh sửa thẻ từ vựng
 */
export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const validation = UpdateCardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu cập nhật thẻ không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    // Kiểm tra thẻ tồn tại và thuộc bộ thẻ của user
    const existingCard = await prisma.card.findFirst({
      where: {
        id,
        studySet: { userId: user.id },
      },
    })

    if (!existingCard) {
      return NextResponse.json(
        { error: "Không tìm thấy thẻ hoặc bạn không có quyền chỉnh sửa." },
        { status: 404 }
      )
    }

    const data = validation.data
    const tagIds = data.tagIds

    // Nếu có tagIds, kiểm tra xem tags có thuộc về user không
    if (tagIds !== undefined && tagIds.length > 0) {
      const validTagsCount = await prisma.tag.count({
        where: {
          id: { in: tagIds },
          userId: user.id,
        },
      })
      if (validTagsCount !== tagIds.length) {
        return NextResponse.json(
          { error: "Một hoặc nhiều nhãn (tags) không hợp lệ." },
          { status: 400 }
        )
      }
    }

    // Cập nhật card và tags trong Transaction
    await prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id },
        data: {
          ...(data.term !== undefined && { term: data.term }),
          ...(data.reading !== undefined && { reading: data.reading }),
          ...(data.definition !== undefined && { definition: data.definition }),
          ...(data.example !== undefined && { example: data.example }),
          ...(data.exampleTranslation !== undefined && {
            exampleTranslation: data.exampleTranslation,
          }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
          ...(data.note !== undefined && { note: data.note }),
          ...(data.jlptLevel !== undefined && { jlptLevel: data.jlptLevel }),
          ...(data.wordType !== undefined && { wordType: data.wordType }),
          ...(data.radicals !== undefined && { radicals: data.radicals }),
          ...(data.strokeCount !== undefined && {
            strokeCount: data.strokeCount,
          }),
          ...(data.onReading !== undefined && { onReading: data.onReading }),
          ...(data.kunReading !== undefined && { kunReading: data.kunReading }),
          ...(data.compounds !== undefined && { compounds: data.compounds }),
          ...(data.order !== undefined && { order: data.order }),
        },
      })

      // Nếu có cập nhật tagIds
      if (tagIds !== undefined) {
        await tx.cardTag.deleteMany({
          where: { cardId: id },
        })

        if (tagIds.length > 0) {
          await tx.cardTag.createMany({
            data: tagIds.map((tagId) => ({
              cardId: id,
              tagId,
            })),
          })
        }
      }
    })

    // Lấy lại card hoàn chỉnh sau khi cập nhật
    const updatedCard = await prisma.card.findUnique({
      where: { id },
      include: {
        cardTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        srsData: {
          where: { userId: user.id },
          take: 1,
        },
      },
    })

    const formattedResult = {
      id: updatedCard!.id,
      studySetId: updatedCard!.studySetId,
      term: updatedCard!.term,
      reading: updatedCard!.reading,
      definition: updatedCard!.definition,
      example: updatedCard!.example,
      exampleTranslation: updatedCard!.exampleTranslation,
      imageUrl: updatedCard!.imageUrl,
      audioUrl: updatedCard!.audioUrl,
      note: updatedCard!.note,
      jlptLevel: updatedCard!.jlptLevel,
      wordType: updatedCard!.wordType,
      radicals: updatedCard!.radicals,
      strokeCount: updatedCard!.strokeCount,
      onReading: updatedCard!.onReading,
      kunReading: updatedCard!.kunReading,
      compounds: updatedCard!.compounds,
      order: updatedCard!.order,
      createdAt: updatedCard!.createdAt,
      updatedAt: updatedCard!.updatedAt,
      tags: updatedCard!.cardTags.map((ct) => ct.tag),
      srsData: updatedCard!.srsData[0] || null,
    }

    return NextResponse.json(formattedResult)
  } catch (error) {
    console.error("❌ Lỗi PATCH /api/cards/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi cập nhật thẻ." },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cards/[id] — Xóa thẻ từ vựng
 */
export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingCard = await prisma.card.findFirst({
      where: {
        id,
        studySet: { userId: user.id },
      },
      select: {
        id: true,
        studySetId: true,
      },
    })

    if (!existingCard) {
      return NextResponse.json(
        { error: "Không tìm thấy thẻ hoặc bạn không có quyền xóa." },
        { status: 404 }
      )
    }

    // Xóa thẻ và cập nhật lại cardCount của bộ thẻ
    await prisma.$transaction(async (tx) => {
      await tx.card.delete({
        where: { id },
      })

      const count = await tx.card.count({
        where: { studySetId: existingCard.studySetId },
      })

      await tx.studySet.update({
        where: { id: existingCard.studySetId },
        data: { cardCount: count },
      })
    })

    return NextResponse.json({
      success: true,
      message: "Đã xóa thẻ học thành công.",
    })
  } catch (error) {
    console.error("❌ Lỗi DELETE /api/cards/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi xóa thẻ." },
      { status: 500 }
    )
  }
}
