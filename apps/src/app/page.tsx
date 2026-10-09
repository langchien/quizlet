"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  BookOpen,
  CheckCircle2,
  Database,
  Flame,
  Layers,
  Sparkles,
  Zap,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ShieldCheck,
  Target,
  ArrowRight,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { APP_NAME, APP_TITLE, JLPT_LEVELS, STUDY_MODES } from "@/types"
import { useAppStore } from "@/stores/useAppStore"
import { useAuthStore } from "@/stores/useAuthStore"
import type { HealthCheckResponse } from "@/types"

async function fetchHealth(): Promise<HealthCheckResponse> {
  const res = await fetch("/api/health")
  if (!res.ok) {
    throw new Error("Không thể kết nối đến Database")
  }
  return res.json()
}

export default function HomePage() {
  const { selectedJLPTLevel, setSelectedJLPTLevel } = useAppStore()
  const { user, isAuthenticated, fetchCurrentUser, logout, isLoading } =
    useAuthStore()

  React.useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const {
    data: health,
    isLoading: loadingHealth,
    refetch,
  } = useQuery({
    queryKey: ["healthCheck"],
    queryFn: fetchHealth,
  })

  const handleManualCheck = async () => {
    const result = await refetch()
    if (result.data?.status === "ok" && result.data?.database === "connected") {
      toast.success("Kết nối PostgreSQL qua Prisma thành công!", {
        description: `Trạng thái: ${result.data.status} | DB: ${result.data.database}`,
      })
    } else {
      toast.error("Lỗi kết nối cơ sở dữ liệu")
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Đã đăng xuất tài khoản thành công")
    } catch {
      toast.error("Đăng xuất thất bại")
    }
  }

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 relative flex min-h-screen flex-col">
      {/* Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-20" />

      {/* Navigation Top Bar */}
      <header className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="from-primary text-primary-foreground shadow-primary/20 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br to-rose-600 shadow-md">
              <span className="text-lg font-bold">日</span>
            </div>
            <div>
              <span className="text-foreground text-xl font-bold tracking-tight">
                {APP_NAME}
              </span>
              <span className="text-muted-foreground ml-1.5 hidden text-xs font-medium sm:inline-block">
                (日本メモ)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="border-border/70 bg-card hidden items-center gap-2 rounded-full border px-3 py-1 text-xs sm:flex">
                  <User className="text-primary size-3.5" />
                  <span className="font-medium">{user.name}</span>
                  <Badge variant="success" className="h-4 px-1.5 text-[10px]">
                    Đã đăng nhập
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="gap-1.5"
                >
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-1.5"
                  )}
                >
                  <LogIn className="size-3.5" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
                >
                  <UserPlus className="size-3.5" />
                  <span className="hidden sm:inline">Đăng ký</span>
                </Link>
              </div>
            )}

            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Badge */}
          <div className="border-primary/20 bg-primary/5 text-primary dark:bg-primary/10 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Phase 1 — Xác thực & Database Schema Hoàn Tất</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
            Chào mừng đến với{" "}
            <span className="from-primary bg-gradient-to-r via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              {APP_TITLE}
            </span>
          </h1>

          <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">
            Nền tảng học từ vựng, Kanji và ngữ pháp tiếng Nhật cá nhân hoá kết
            hợp thuật toán lặp lại ngắt quãng (Spaced Repetition System - SRS).
          </p>

          {/* Auth Action Callout */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                <span>
                  Xin chào, <strong>{user?.name}</strong> ({user?.email})! Bạn
                  đã sẵn sàng học tập.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "shadow-primary/20 gap-2 shadow-lg"
                  )}
                >
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "gap-2"
                  )}
                >
                  <span>Tạo tài khoản miễn phí</span>
                </Link>
              </div>
            )}
          </div>

          {/* Health & DB Status Card */}
          <div className="border-border/60 bg-card shadow-foreground/5 mt-8 w-full max-w-md rounded-2xl border p-6 text-left shadow-xl">
            <div className="border-border/50 flex items-center justify-between border-b pb-4">
              <div className="text-foreground flex items-center gap-2 font-medium">
                <Database className="h-4 w-4 text-emerald-500" />
                <span>Trạng thái kết nối</span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  health?.database === "connected"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    health?.database === "connected"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                {health?.database === "connected"
                  ? "Đã kết nối PostgreSQL"
                  : loadingHealth
                    ? "Đang tải dữ liệu..."
                    : "Chưa kết nối"}
              </span>
            </div>

            <div className="text-muted-foreground mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>API Endpoint:</span>
                <code className="text-foreground font-mono text-xs">
                  /api/health
                </code>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-foreground">
                  PostgreSQL 15 (Docker: 54321)
                </span>
              </div>
              <div className="flex justify-between">
                <span>ORM:</span>
                <span className="text-foreground">Prisma v7 (adapter-pg)</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian phản hồi:</span>
                <span className="text-foreground">
                  {health?.timestamp
                    ? new Date(health.timestamp).toLocaleTimeString()
                    : "--"}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleManualCheck}
                disabled={loadingHealth}
              >
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                {loadingHealth ? "Đang kiểm tra..." : "Kiểm tra lại"}
              </Button>
            </div>
          </div>

          {/* JLPT Levels Filter Selector */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Chọn cấp độ JLPT mục tiêu
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedJLPTLevel("ALL")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedJLPTLevel === "ALL"
                    ? "bg-primary text-primary-foreground shadow"
                    : "border-border/80 bg-muted/40 hover:bg-muted border"
                }`}
              >
                Tất cả
              </button>
              {JLPT_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedJLPTLevel(level)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    selectedJLPTLevel === level
                      ? "bg-primary text-primary-foreground shadow"
                      : "border-border/80 bg-muted/40 hover:bg-muted border"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Study Modes Overview */}
          <div className="mt-10 w-full max-w-3xl">
            <div className="text-muted-foreground mb-4 text-center text-xs font-medium tracking-wider uppercase">
              6 Chế độ học tập cốt lõi
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {STUDY_MODES.map((mode) => (
                <div
                  key={mode}
                  className="border-border/50 bg-card/60 hover:border-primary/40 hover:bg-card flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors"
                >
                  <BookOpen className="text-primary/70 mb-1.5 h-4 w-4" />
                  <span className="text-foreground text-xs font-medium">
                    {mode}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {[
              "Next.js 16 (App Router)",
              "React 19",
              "TypeScript Strict",
              "Tailwind CSS v4",
              "Shadcn UI",
              "Prisma ORM 7",
              "PostgreSQL Docker",
              "JWT & HttpOnly Cookies",
              "Zustand State",
              "TanStack Query v5",
              "Zod Validation",
            ].map((tech) => (
              <span
                key={tech}
                className="border-border/60 bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border/40 text-muted-foreground border-t py-6 text-center text-xs">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <span>© 2026 {APP_NAME} — 日本メモ. Bản quyền thuộc về tác giả.</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" /> App Router
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
