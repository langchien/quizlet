"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Library,
  Tag,
  Calendar,
  BarChart3,
  Settings,
  AlertCircle,
  UploadCloud,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavMenuProps {
  collapsed: boolean
}

export function SidebarNavMenu({ collapsed }: SidebarNavMenuProps) {
  const pathname = usePathname()

  const navItems = React.useMemo(
    () => [
      {
        title: "Bảng điều khiển",
        href: "/dashboard",
        icon: LayoutDashboard,
        active: pathname === "/dashboard" || pathname === "/",
      },
      {
        title: "Thư viện bộ thẻ",
        href: "/library",
        icon: Library,
        active: pathname === "/library" || pathname.startsWith("/sets"),
      },
      {
        title: "Nhãn phân loại",
        href: "/tags",
        icon: Tag,
        active: pathname.startsWith("/tags"),
      },
      {
        title: "Ôn tập lỗi sai",
        href: "/study/mistakes",
        icon: AlertCircle,
        active: pathname === "/study/mistakes",
      },
      {
        title: "Lịch ôn tập",
        href: "/calendar",
        icon: Calendar,
        active: pathname.startsWith("/calendar"),
      },
      {
        title: "Thống kê",
        href: "/stats",
        icon: BarChart3,
        active: pathname.startsWith("/stats"),
      },
      {
        title: "Nhập / Xuất dữ liệu",
        href: "/import-export",
        icon: UploadCloud,
        active: pathname.startsWith("/import-export"),
      },
      {
        title: "Cài đặt",
        href: "/settings",
        icon: Settings,
        active: pathname.startsWith("/settings"),
      },
    ],
    [pathname]
  )

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
            item.active
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? item.title : undefined}
        >
          <item.icon className="size-4 shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </Link>
      ))}
    </nav>
  )
}
