"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  BookOpen,
  FolderPlus,
  Tag,
  LogOut,
  Settings,
  Menu,
  Keyboard,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/useAuthStore"
import { toast } from "sonner"

interface TopbarProps {
  onOpenSearch: () => void
  onOpenCreateSet: () => void
  onOpenCreateFolder: () => void
  onOpenCreateTag: () => void
  onToggleMobileSidebar: () => void
  onOpenShortcuts?: () => void
}

export function Topbar({
  onOpenSearch,
  onOpenCreateSet,
  onOpenCreateFolder,
  onOpenCreateTag,
  onToggleMobileSidebar,
  onOpenShortcuts,
}: TopbarProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Đăng xuất thành công")
      router.push("/login")
    } catch {
      toast.error("Đăng xuất thất bại")
    }
  }

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
      {/* Left side: Mobile menu toggle + Global Search */}
      <div className="flex max-w-xl flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleMobileSidebar}
          className="md:hidden"
        >
          <Menu className="size-5" />
          <span className="sr-only">Mở menu</span>
        </Button>

        {/* Search Bar trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="border-input bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground flex h-9 w-full max-w-md cursor-pointer items-center justify-between rounded-xl border px-3 text-xs shadow-2xs transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4" />
            <span className="hidden sm:inline">
              Tìm kiếm bộ thẻ, từ vựng, Kanji...
            </span>
            <span className="sm:hidden">Tìm kiếm...</span>
          </span>
          <kbd className="border-border bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right side: Quick Create + Theme Toggle + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                className="shadow-primary/20 gap-1.5 shadow-xs"
              />
            }
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Tạo mới</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Tạo nội dung mới</DropdownMenuLabel>
            <DropdownMenuItem onClick={onOpenCreateSet} className="gap-2">
              <BookOpen className="text-primary size-4" />
              <span>Bộ thẻ mới</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenCreateFolder} className="gap-2">
              <FolderPlus className="size-4 text-blue-500" />
              <span>Thư mục mới</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenCreateTag} className="gap-2">
              <Tag className="size-4 text-purple-500" />
              <span>Nhãn phân loại mới</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ModeToggle />

        {onOpenShortcuts && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onOpenShortcuts}
            title="Bảng phím tắt (?)"
            className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
          >
            <Keyboard className="size-4" />
            <span className="sr-only">Phím tắt</span>
          </Button>
        )}

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="border-border bg-card hover:bg-muted flex items-center gap-2 rounded-full border p-1 transition-colors"
              />
            }
          >
            <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col space-y-0.5 p-2">
              <p className="text-foreground truncate text-xs font-semibold">
                {user?.name || "Người dùng"}
              </p>
              <p className="text-muted-foreground truncate text-[11px]">
                {user?.email || ""}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="gap-2"
            >
              <Settings className="size-4" />
              <span>Cài đặt tài khoản</span>
            </DropdownMenuItem>
            {onOpenShortcuts && (
              <DropdownMenuItem onClick={onOpenShortcuts} className="gap-2">
                <Keyboard className="size-4" />
                <span>Bảng phím tắt (?)</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="size-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
