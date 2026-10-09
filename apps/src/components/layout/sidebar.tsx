"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useSidebarFolders } from "@/hooks/sidebar"
import {
  SidebarHeader,
  SidebarNavMenu,
  SidebarFolderTree,
  SidebarCreateButton,
  SidebarDeleteDialog,
} from "@/components/layout/sidebar-parts"
import type { SidebarProps } from "@/types/sidebar"

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onOpenCreateSet,
  onOpenCreateFolder,
  onEditFolder,
}: SidebarProps) {
  const {
    folders,
    loadingFolders,
    expandedFolderIds,
    folderToDelete,
    setFolderToDelete,
    toggleFolder,
    confirmDeleteFolder,
  } = useSidebarFolders()

  return (
    <aside
      className={cn(
        "border-border bg-card/60 relative z-30 flex flex-col border-r backdrop-blur-md transition-all duration-300 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <SidebarHeader
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
      />

      {/* Main Navigation Menu & Folders Tree */}
      <div className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        <SidebarNavMenu collapsed={collapsed} />

        {!collapsed && (
          <SidebarFolderTree
            folders={folders}
            loadingFolders={loadingFolders}
            expandedFolderIds={expandedFolderIds}
            onToggleFolder={toggleFolder}
            onOpenCreateSet={onOpenCreateSet}
            onOpenCreateFolder={onOpenCreateFolder}
            onEditFolder={onEditFolder}
            onSelectFolderToDelete={setFolderToDelete}
          />
        )}
      </div>

      {/* Quick Action Button */}
      {!collapsed && (
        <SidebarCreateButton onOpenCreateSet={() => onOpenCreateSet()} />
      )}

      {/* Delete Folder Alert Dialog */}
      <SidebarDeleteDialog
        folderToDelete={folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirmDelete={confirmDeleteFolder}
      />
    </aside>
  )
}
