"use client"

import * as React from "react"
import { Settings as SettingsIcon, User, Moon, Keyboard } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import { ModeToggle } from "@/components/mode-toggle"

export default function SettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <SettingsIcon className="text-primary size-6" />
          <span>Cài đặt hệ thống</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Quản lý tài khoản, tuỳ chỉnh giao diện và cấu hình phương pháp học
          tập.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="border-border bg-card space-y-3 rounded-2xl border p-5">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <User className="text-primary size-4" />
            <span>Thông tin cá nhân</span>
          </h2>
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Họ và tên:</span>
              <p className="text-foreground mt-0.5 font-semibold">
                {user?.name || "--"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Email đăng nhập:</span>
              <p className="text-foreground mt-0.5 font-semibold">
                {user?.email || "--"}
              </p>
            </div>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="border-border bg-card space-y-3 rounded-2xl border p-5">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <Moon className="text-primary size-4" />
            <span>Giao diện & Chủ đề</span>
          </h2>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Chuyển đổi giao diện Sáng / Tối / Hệ thống
            </span>
            <ModeToggle />
          </div>
        </div>

        {/* Shortcuts Card */}
        <div className="border-border bg-card space-y-3 rounded-2xl border p-5">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <Keyboard className="text-primary size-4" />
            <span>Phím tắt toàn cục</span>
          </h2>
          <div className="space-y-2 text-xs">
            <div className="border-border/50 flex items-center justify-between border-b py-1">
              <span className="text-muted-foreground">Tìm kiếm toàn cục</span>
              <kbd className="border-border bg-muted text-foreground rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                Ctrl + K / ⌘ + K
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Đóng hộp thoại</span>
              <kbd className="border-border bg-muted text-foreground rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                ESC
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
