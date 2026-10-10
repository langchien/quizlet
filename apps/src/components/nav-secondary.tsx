"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Keyboard } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavSecondaryProps extends React.ComponentProps<typeof SidebarGroup> {
  onOpenShortcuts?: () => void
}

export function NavSecondary({ onOpenShortcuts, ...props }: NavSecondaryProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cài đặt hệ thống"
              isActive={pathname.startsWith("/settings")}
              render={<Link href="/settings" />}
            >
              <Settings className="size-4 shrink-0" />
              <span>Cài đặt</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {onOpenShortcuts && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Bảng phím tắt (?)"
                onClick={onOpenShortcuts}
              >
                <Keyboard className="size-4 shrink-0" />
                <span>Bảng phím tắt</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
