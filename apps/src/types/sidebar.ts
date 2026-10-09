import type * as React from "react"
import type { FolderNode } from "@/lib/dal/folders"

export interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenCreateSet: (folderId?: string) => void
  onOpenCreateFolder: (parentId?: string) => void
  onEditFolder: (folder: {
    id: string
    name: string
    description?: string | null
  }) => void
}

export interface SidebarNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
}

export interface FolderToDelete {
  id: string
  name: string
}

export type { FolderNode }
