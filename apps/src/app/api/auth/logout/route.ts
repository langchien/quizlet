import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { clearAuthCookies } from "@/lib/auth"

export async function POST() {
  try {
    const cookieStore = await cookies()
    await clearAuthCookies(cookieStore)

    return NextResponse.json({
      message: "Đăng xuất thành công",
    })
  } catch (error) {
    console.error("❌ Lỗi API Logout:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng xuất." },
      { status: 500 }
    )
  }
}
