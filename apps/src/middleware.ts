import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const ACCESS_TOKEN_COOKIE = "nihomemo_access_token"
const REFRESH_TOKEN_COOKIE = "nihomemo_refresh_token"

// Secret key
const accessSecret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "default_super_secret_access_jwt_key_32bytes"
)
const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ||
    "default_super_secret_refresh_jwt_key_32bytes"
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bỏ qua các file tĩnh và API không cần auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/refresh") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  let isAuthenticated = false

  if (accessToken) {
    try {
      await jwtVerify(accessToken, accessSecret)
      isAuthenticated = true
    } catch {
      // Access token hết hạn, kiểm tra refresh token
      if (refreshToken) {
        try {
          await jwtVerify(refreshToken, refreshSecret)
          isAuthenticated = true
        } catch {
          isAuthenticated = false
        }
      }
    }
  } else if (refreshToken) {
    try {
      await jwtVerify(refreshToken, refreshSecret)
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }

  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isApiRoute = pathname.startsWith("/api")

  // Nếu người dùng đã đăng nhập mà truy cập trang /login hoặc /register -> redirect về trang chủ
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Nếu người dùng chưa đăng nhập mà truy cập route cần bảo vệ
  if (!isAuthenticated && !isAuthPage) {
    if (isApiRoute) {
      // Nếu là API route -> trả về 401 Unauthorized
      return NextResponse.json(
        { error: "Yêu cầu đăng nhập để truy cập tài nguyên này." },
        { status: 401 }
      )
    }

    // Nếu là trang UI -> redirect về /login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Khớp tất cả request paths ngoại trừ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
}
