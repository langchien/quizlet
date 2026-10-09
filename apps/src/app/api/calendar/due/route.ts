import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem lịch ôn tập." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const now = new Date()
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()))
    const month = parseInt(
      searchParams.get("month") || String(now.getMonth() + 1)
    )

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Tháng hoặc năm không hợp lệ." },
        { status: 400 }
      )
    }

    // Xác định ngày cuối của tháng
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    // Xác định mốc hôm nay
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    // Lấy tất cả SRSData của user có nextReviewDate
    const allSRS = await prisma.sRSData.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        status: true,
        nextReviewDate: true,
      },
    })

    const daysInMonth = endOfMonth.getDate()
    const days: Record<
      string,
      {
        date: string
        dueCount: number
        newCount: number
        learningCount: number
        reviewCount: number
      }
    > = {}

    // Khởi tạo tất cả các ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      days[dateStr] = {
        date: dateStr,
        dueCount: 0,
        newCount: 0,
        learningCount: 0,
        reviewCount: 0,
      }
    }

    let overdueCount = 0
    let totalDueToday = 0
    let totalDueThisMonth = 0

    for (const item of allSRS) {
      const reviewDate = new Date(item.nextReviewDate)
      const isPast = reviewDate < startOfToday
      const isToday = reviewDate >= startOfToday && reviewDate <= endOfToday

      if (isPast) {
        overdueCount += 1
      }
      if (isPast || isToday) {
        totalDueToday += 1
      }

      // Format ngày của thẻ
      const rYear = reviewDate.getFullYear()
      const rMonth = reviewDate.getMonth() + 1
      const rDay = reviewDate.getDate()
      const rDateStr = `${rYear}-${String(rMonth).padStart(2, "0")}-${String(rDay).padStart(2, "0")}`

      if (days[rDateStr]) {
        days[rDateStr].dueCount += 1
        if (item.status === "New") days[rDateStr].newCount += 1
        else if (item.status === "Learning") days[rDateStr].learningCount += 1
        else if (item.status === "Review" || item.status === "Mastered")
          days[rDateStr].reviewCount += 1

        totalDueThisMonth += 1
      }
    }

    // Nếu có thẻ quá hạn và tháng hiện tại đang xem là tháng chứa hôm nay, gộp quá hạn vào ngày hôm nay để người dùng thấy rõ
    if (
      overdueCount > 0 &&
      year === now.getFullYear() &&
      month === now.getMonth() + 1 &&
      days[todayStr]
    ) {
      // Thông số days[todayStr].dueCount có thể phản ánh tổng cần học hôm nay bao gồm cả overdue
      // nhưng ta giữ nguyên cấu trúc và trả về kèm overdueCount rõ ràng
    }

    return NextResponse.json({
      year,
      month,
      days,
      totalDueThisMonth,
      totalDueToday,
      overdueCount,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/calendar/due:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy dữ liệu lịch ôn tập." },
      { status: 500 }
    )
  }
}
