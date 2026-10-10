"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { APP_NAME } from "@/types"
import {
  BookOpen,
  FolderPlus,
  Keyboard,
  PanelLeft,
  Plus,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SiteHeaderProps {
  onOpenSearch: () => void
  onOpenCreateSet: () => void
  onOpenCreateFolder: () => void
  onOpenCreateTag: () => void
  onOpenShortcuts?: () => void
}

function getPageTitle(pathname: string): { parent?: string; title: string } {
  if (pathname === "/dashboard" || pathname === "/") {
    return { title: "Bảng điều khiển" }
  }
  if (pathname.startsWith("/library")) {
    return { parent: "Học tập", title: "Thư viện bộ thẻ" }
  }
  if (pathname.startsWith("/sets")) {
    return { parent: "Thư viện", title: "Chi tiết bộ thẻ" }
  }
  if (pathname.startsWith("/tags")) {
    return { parent: "Quản lý", title: "Nhãn phân loại" }
  }
  if (pathname === "/study/mistakes") {
    return { parent: "Ôn tập", title: "Sổ tay lỗi sai" }
  }
  if (pathname.startsWith("/study")) {
    return { parent: "Ôn tập", title: "Học bộ thẻ" }
  }
  if (pathname.startsWith("/calendar")) {
    return { parent: "Kế hoạch", title: "Lịch ôn tập SRS" }
  }
  if (pathname.startsWith("/stats")) {
    return { parent: "Tiến độ", title: "Thống kê học tập" }
  }
  if (pathname.startsWith("/import-export")) {
    return { parent: "Công cụ", title: "Nhập / Xuất dữ liệu" }
  }
  if (pathname.startsWith("/settings")) {
    return { parent: "Hệ thống", title: "Cài đặt tài khoản" }
  }
  return { title: "NihoMemo" }
}

export function SiteHeader({
  onOpenSearch,
  onOpenCreateSet,
  onOpenCreateFolder,
  onOpenCreateTag,
  onOpenShortcuts,
}: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const pageInfo = getPageTitle(pathname)

  return (
    <header className="bg-background/95 sticky top-0 z-50 flex h-(--header-height) w-full items-center border-b backdrop-blur-md">
      <div className="flex w-full items-center justify-between gap-3 px-4">
        {/* Left Side: Toggle Sidebar + Brand + Breadcrumbs */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            className="size-8 cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title="Đóng / mở sidebar"
          >
            <PanelLeft className="size-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>

          <Separator
            orientation="vertical"
            className="h-4 data-vertical:h-4 data-vertical:self-auto"
          />

          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="from-primary flex size-7 items-center justify-center rounded-lg bg-gradient-to-br to-rose-600 text-xs font-bold text-white shadow-xs">
              日
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-foreground text-xs font-bold tracking-tight">
                {APP_NAME}
              </span>
              <span className="text-muted-foreground text-[9px] leading-none">
                日本メモ
              </span>
            </div>
          </Link>

          <Separator
            orientation="vertical"
            className="hidden h-4 data-vertical:h-4 data-vertical:self-auto md:block"
          />

          {/* Breadcrumb Navigation */}
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/dashboard" />}>
                  Trang chủ
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pageInfo.parent && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="text-muted-foreground">
                      {pageInfo.parent}
                    </span>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageInfo.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right Side: Global Search + Quick Create + ModeToggle + Shortcuts */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <SearchForm
            onOpenSearch={onOpenSearch}
            className="w-36 sm:w-56 md:w-64"
          />

          {/* Quick Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  className="cursor-pointer gap-1.5 shadow-xs"
                />
              }
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Tạo mới</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Tạo nội dung mới</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={onOpenCreateSet}
                  className="cursor-pointer gap-2"
                >
                  <BookOpen className="text-primary size-4" />
                  <span>Bộ thẻ mới</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onOpenCreateFolder}
                  className="cursor-pointer gap-2"
                >
                  <FolderPlus className="size-4 text-blue-500" />
                  <span>Thư mục mới</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onOpenCreateTag}
                  className="cursor-pointer gap-2"
                >
                  <Tag className="size-4 text-purple-500" />
                  <span>Nhãn phân loại mới</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          {onOpenShortcuts && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onOpenShortcuts}
              title="Bảng phím tắt (?)"
              className="text-muted-foreground hover:text-foreground hidden cursor-pointer sm:inline-flex"
            >
              <Keyboard className="size-4" />
              <span className="sr-only">Phím tắt</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
