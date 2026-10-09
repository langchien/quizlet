import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { UpdateTagSchema } from "@/schemas/tag"

interface RouteProps {
  params: Promise<{ id: string }>
}

/**
 * GET /api/tags/[id] — Chi tiết nhãn
 */
export async function GET(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập tài nguyên này." },
        { status: 401 }
      )
    }

    const { id } = await params

    const tag = await prisma.tag.findFirst({
      where: { id, userId: user.id },
      include: {
        _count: {
          select: { cardTags: true },
        },
      },
    })

    if (!tag) {
      return NextResponse.json(
        { error: "Không tìm thấy nhãn hoặc bạn không có quyền truy cập." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      userId: tag.userId,
      cardCount: tag._count.cardTags,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/tags/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy chi tiết nhãn." },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tags/[id] — Cập nhật tên hoặc màu nhãn
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
    const validation = UpdateTagSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu cập nhật nhãn không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const existingTag = await prisma.tag.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: "Không tìm thấy nhãn hoặc bạn không có quyền chỉnh sửa." },
        { status: 404 }
      )
    }

    const { name, color } = validation.data

    // Nếu đổi tên, kiểm tra trùng tên
    if (name && name.toLowerCase() !== existingTag.name.toLowerCase()) {
      const duplicate = await prisma.tag.findFirst({
        where: {
          userId: user.id,
          name: { equals: name, mode: "insensitive" },
          NOT: { id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: `Tên nhãn "${name}" đã được sử dụng.` },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
      },
      include: {
        _count: {
          select: { cardTags: true },
        },
      },
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      color: updated.color,
      userId: updated.userId,
      cardCount: updated._count.cardTags,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    })
  } catch (error) {
    console.error("❌ Lỗi PATCH /api/tags/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi cập nhật nhãn." },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tags/[id] — Xoá nhãn (chỉ xoá liên kết CardTag, không làm mất thẻ)
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

    const existingTag = await prisma.tag.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: "Không tìm thấy nhãn hoặc bạn không có quyền xoá." },
        { status: 404 }
      )
    }

    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Đã xóa nhãn thành công.",
    })
  } catch (error) {
    console.error("❌ Lỗi DELETE /api/tags/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi xóa nhãn." },
      { status: 500 }
    )
  }
}
