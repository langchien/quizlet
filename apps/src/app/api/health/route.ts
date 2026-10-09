import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const startTime = Date.now()

/**
 * Endpoint kiểm tra tình trạng máy chủ và kết nối cơ sở dữ liệu
 * GET /api/health
 */
export async function GET() {
  try {
    // Kiểm tra kết nối PostgreSQL qua Prisma
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      database: "connected",
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("❌ Lỗi kiểm tra database trong /api/health:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
        database: "disconnected",
        environment: process.env.NODE_ENV || "development",
        error:
          error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 }
    )
  }
}
