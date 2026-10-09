"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  FolderPlus,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { FolderNode, FolderToDelete } from "@/types/sidebar"

interface SidebarFolderNodeProps {
  node: FolderNode
  level?: number
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

export function SidebarFolderNode({
  node,
  level = 0,
  expandedFolderIds,
  onToggleFolder,
  onOpenCreateSet,
  onOpenCreateFolder,
  onEditFolder,
  onSelectFolderToDelete,
}: SidebarFolderNodeProps) {
  const router = useRouter()
  const isExpanded = expandedFolderIds.has(node.id)

  return (
    <div className="select-none">
      <div
        className={cn(
          "group text-foreground/80 hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
          level > 0 && `ml-${Math.min(level * 3, 6)}`
        )}
        onClick={() => router.push(`/library?folderId=${node.id}`)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => onToggleFolder(node.id, e)}
            aria-label={isExpanded ? "Thu gọn thư mục" : "Mở rộng thư mục"}
            className="text-muted-foreground hover:text-foreground rounded p-0.5"
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
          {isExpanded ? (
            <FolderOpen className="size-4 shrink-0 text-blue-500" />
          ) : (
            <Folder className="size-4 shrink-0 text-blue-500" />
          )}
          <span className="truncate font-medium">{node.name}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground rounded p-1"
              onClick={(e) => e.stopPropagation()}
              aria-label="Tùy chọn thư mục"
            >
              <MoreVertical className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem
                onClick={() => onOpenCreateSet(node.id)}
                className="gap-2"
              >
                <Plus className="text-primary size-3.5" />
                <span>Tạo bộ thẻ ở đây</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onOpenCreateFolder(node.id)}
                className="gap-2"
              >
                <FolderPlus className="size-3.5 text-blue-500" />
                <span>Tạo thư mục con</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onEditFolder({
                    id: node.id,
                    name: node.name,
                    description: node.description,
                  })
                }
                className="gap-2"
              >
                <Edit2 className="size-3.5" />
                <span>Đổi tên / sửa</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  onSelectFolderToDelete({ id: node.id, name: node.name })
                }
                className="gap-2"
              >
                <Trash2 className="size-3.5" />
                <span>Xoá thư mục</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cây con (Subfolders & Sets) */}
      {isExpanded && (
        <div className="border-border/60 mt-0.5 ml-3 space-y-0.5 border-l pl-3">
          {node.children?.map((child) => (
            <SidebarFolderNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedFolderIds={expandedFolderIds}
              onToggleFolder={onToggleFolder}
              onOpenCreateSet={onOpenCreateSet}
              onOpenCreateFolder={onOpenCreateFolder}
              onEditFolder={onEditFolder}
              onSelectFolderToDelete={onSelectFolderToDelete}
            />
          ))}
          {node.studySets?.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${set.id}`}
              className="text-muted-foreground hover:bg-muted hover:text-foreground group flex items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <BookOpen className="text-primary/70 size-3.5 shrink-0" />
                <span className="truncate">{set.name}</span>
              </div>
              <span className="text-muted-foreground group-hover:text-foreground text-[10px]">
                {set.cardCount}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
