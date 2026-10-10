"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, Settings, Keyboard, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/useAuthStore"
import { toast } from "sonner"

interface NavUserProps {
  onOpenShortcuts?: () => void
}

export function NavUser({ onOpenShortcuts }: NavUserProps) {
  const { isMobile } = useSidebar()
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

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
              <AvatarFallback className="bg-primary/10 text-primary rounded-lg font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user?.name || "Người dùng"}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email || ""}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={user?.avatar || ""}
                      alt={user?.name || ""}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary rounded-lg font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || "Người dùng"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user?.email || ""}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="cursor-pointer gap-2"
              >
                <Settings className="size-4" />
                <span>Cài đặt tài khoản</span>
              </DropdownMenuItem>
              {onOpenShortcuts && (
                <DropdownMenuItem
                  onClick={onOpenShortcuts}
                  className="cursor-pointer gap-2"
                >
                  <Keyboard className="size-4" />
                  <span>Bảng phím tắt (?)</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="cursor-pointer gap-2"
            >
              <LogOut className="size-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
