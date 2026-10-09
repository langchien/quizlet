"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import type { FolderNode, FolderToDelete } from "@/types/sidebar"
import { SidebarFolderNode } from "./sidebar-folder-node"

interface SidebarFolderTreeProps {
  folders: FolderNode[]
  loadingFolders: boolean
  expandedFolderIds: Set<string>
  onToggleFolder: (id: string, e: React.MouseEvent) => void
  onOpenCreateSet: (folderId?: string) => void
  onOpenCreateFolder: (parentId?: string) => void
  onEditFolder: (folder: {
    id: string
    name: string
    description?: string | null
  }) => void
  onSelectFolderToDelete: (folder: FolderToDelete) => void
}

export function SidebarFolderTree({
  folders,
  loadingFolders,
  expandedFolderIds,
  onToggleFolder,
  onOpenCreateSet,
  onOpenCreateFolder,
  onEditFolder,
  onSelectFolderToDelete,
}: SidebarFolderTreeProps) {
  return (
    <div className="border-border/50 border-t pt-2">
      <div className="flex items-center justify-between px-2 pb-1.5">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Thư mục học tập
        </span>
        <button
          type="button"
          onClick={() => onOpenCreateFolder()}
          title="Tạo thư mục mới"
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="space-y-0.5">
        {loadingFolders ? (
          <div className="text-muted-foreground px-3 py-2 text-xs">
            Đang tải...
          </div>
        ) : folders.length === 0 ? (
          <div className="text-muted-foreground px-3 py-2 text-center text-xs">
            Chưa có thư mục nào.
          </div>
        ) : (
          folders.map((node) => (
            <SidebarFolderNode
              key={node.id}
              node={node}
              expandedFolderIds={expandedFolderIds}
              onToggleFolder={onToggleFolder}
              onOpenCreateSet={onOpenCreateSet}
              onOpenCreateFolder={onOpenCreateFolder}
              onEditFolder={onEditFolder}
              onSelectFolderToDelete={onSelectFolderToDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
