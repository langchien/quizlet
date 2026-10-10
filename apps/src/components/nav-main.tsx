"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Library,
  Tag,
  AlertCircle,
  Calendar,
  BarChart3,
  UploadCloud,
} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainNavItems = [
  {
    title: "Bảng điều khiển",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Thư viện bộ thẻ",
    url: "/library",
    icon: Library,
  },
  {
    title: "Nhãn phân loại",
    url: "/tags",
    icon: Tag,
  },
  {
    title: "Ôn tập lỗi sai",
    url: "/study/mistakes",
    icon: AlertCircle,
  },
  {
    title: "Lịch ôn tập",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Thống kê",
    url: "/stats",
    icon: BarChart3,
  },
  {
    title: "Nhập / Xuất dữ liệu",
    url: "/import-export",
    icon: UploadCloud,
  },
]

export function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu chính</SidebarGroupLabel>
      <SidebarMenu>
        {mainNavItems.map((item) => {
          const isActive =
            item.url === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname.startsWith(item.url)

          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                render={<Link href={item.url} />}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
