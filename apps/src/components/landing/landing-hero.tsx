"use client"

import * as React from "react"
import Link from "next/link"
import { ShieldCheck, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { APP_TITLE } from "@/types"
import type { AuthUser } from "@/stores/useAuthStore"

interface LandingHeroProps {
  user: AuthUser | null
  isAuthenticated: boolean
}

export function LandingHero({ user, isAuthenticated }: LandingHeroProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
      {/* Badge */}
      <div className="border-primary/20 bg-primary/5 text-primary dark:bg-primary/10 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
        <ShieldCheck className="size-4 text-emerald-500" />
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
        Nền tảng học từ vựng, Kanji và ngữ pháp tiếng Nhật cá nhân hoá kết hợp
        thuật toán lặp lại ngắt quãng (Spaced Repetition System - SRS).
      </p>

      {/* Auth Action Callout */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {isAuthenticated ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              <span>
                Xin chào, <strong>{user?.name}</strong> ({user?.email})! Bạn đã
                sẵn sàng học tập.
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "default" }),
                  "shadow-primary/20 gap-2 shadow-xs"
                )}
              >
                <span>Vào Bảng điều khiển</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/library"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "gap-2"
                )}
              >
                <BookOpen className="size-4" />
                <span>Thư viện bộ thẻ</span>
              </Link>
            </div>
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
    </div>
  )
}
