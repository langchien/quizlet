"use client"

import * as React from "react"
import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

const emptySubscribe = () => () => {}

/**
 * Hook kiểm tra đã mount ở client chưa bằng useSyncExternalStore (chuẩn React 19)
 * Tránh lỗi cascading renders và hydration mismatch
 */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

/**
 * Nút chuyển đổi nhanh chế độ hiển thị Sáng (Light) / Tối (Dark)
 */
export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        aria-label="Đang tải chế độ giao diện"
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const currentTheme = resolvedTheme || theme

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      title={`Chuyển chế độ giao diện (Hiện tại: ${currentTheme})`}
      aria-label="Chuyển chế độ giao diện"
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  )
}
