import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import sharp from "sharp"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

interface RouteProps {
  params: Promise<{ id: string }>
}

// Giới hạn kích thước file upload: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]

/**
 * POST /api/cards/[id]/image — Tải lên và tối ưu hóa ảnh minh họa cho thẻ (Sharp -> WebP)
 */
export async function POST(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params

    // Kiểm tra thẻ tồn tại và thuộc sở hữu của user
    const card = await prisma.card.findFirst({
      where: {
        id,
        studySet: { userId: user.id },
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: "Không tìm thấy thẻ hoặc bạn không có quyền cập nhật ảnh." },
        { status: 404 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Vui lòng chọn một tệp hình ảnh hợp lệ để tải lên." },
        { status: 400 }
      )
    }

    // Kiểm tra định dạng MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Định dạng tệp không được hỗ trợ. Vui lòng tải lên ảnh JPEG, PNG, WebP, GIF hoặc AVIF.",
        },
        { status: 400 }
      )
    }

    // Kiểm tra dung lượng
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Kích thước ảnh vượt quá giới hạn cho phép (Tối đa 5MB)." },
        { status: 400 }
      )
    }

    // Đọc buffer từ file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Chuẩn bị thư mục lưu trữ: public/uploads/cards/
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "cards")
    await fs.mkdir(uploadsDir, { recursive: true })

    // Đặt tên file duy nhất theo id thẻ và timestamp
    const fileName = `card_${id}_${Date.now()}.webp`
    const filePath = path.join(uploadsDir, fileName)

    // Xử lý nén ảnh với Sharp:
    // - Tự động xoay theo EXIF
    // - Resize tối đa 800x800 px giữ nguyên tỉ lệ (fit: inside)
    // - Nén chất lượng 80% sang định dạng WebP
    await sharp(buffer)
      .rotate()
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(filePath)

    const relativeImageUrl = `/uploads/cards/${fileName}`

    // Xóa file ảnh cũ nếu tồn tại trong thư mục cục bộ /uploads/cards/
    if (card.imageUrl && card.imageUrl.startsWith("/uploads/cards/")) {
      const oldFileName = path.basename(card.imageUrl)
      const oldFilePath = path.join(uploadsDir, oldFileName)
      try {
        await fs.unlink(oldFilePath)
      } catch {
        // Bỏ qua lỗi nếu file cũ không tồn tại
      }
    }

    // Cập nhật URL ảnh mới vào cơ sở dữ liệu
    const updatedCard = await prisma.card.update({
      where: { id },
      data: { imageUrl: relativeImageUrl },
      select: {
        id: true,
        imageUrl: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Tải lên và tối ưu hóa ảnh thành công.",
      imageUrl: updatedCard.imageUrl,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/cards/[id]/image:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xử lý và lưu trữ tệp hình ảnh." },
      { status: 500 }
    )
  }
}
