"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavFolders } from "@/components/nav-folders"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onOpenCreateSet?: (folderId?: string) => void
  onOpenCreateFolder?: (parentId?: string) => void
  onEditFolder?: (folder: {
    id: string
    name: string
    description?: string | null
  }) => void
  onOpenShortcuts?: () => void
}

export function AppSidebar({
  onOpenCreateSet,
  onOpenCreateFolder,
  onEditFolder,
  onOpenShortcuts,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => onOpenCreateSet?.()}
              tooltip="Tạo bộ thẻ mới"
              className="bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer justify-center font-semibold transition-colors group-data-[collapsible=icon]:p-0!"
            >
              <Plus className="size-4 shrink-0" />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                Tạo bộ thẻ mới
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <NavFolders
          onOpenCreateSet={onOpenCreateSet}
          onOpenCreateFolder={onOpenCreateFolder}
          onEditFolder={onEditFolder}
        />
        <NavSecondary onOpenShortcuts={onOpenShortcuts} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser onOpenShortcuts={onOpenShortcuts} />
      </SidebarFooter>
    </Sidebar>
  )
}
