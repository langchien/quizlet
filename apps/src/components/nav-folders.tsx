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
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderPlus,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarDeleteDialog } from "@/components/layout/sidebar-parts/sidebar-delete-dialog"
import { useSidebarFolders } from "@/hooks/sidebar"
import type { FolderNode, FolderToDelete } from "@/types/sidebar"

interface NavFoldersProps {
  onOpenCreateSet?: (folderId?: string) => void
  onOpenCreateFolder?: (parentId?: string) => void
  onEditFolder?: (folder: {
    id: string
    name: string
    description?: string | null
  }) => void
}

interface FolderTreeItemProps {
  node: FolderNode
  level?: number
  expandedFolderIds: Set<string>
  onToggleFolder: (id: string, e: React.MouseEvent) => void
  onOpenCreateSet?: (folderId?: string) => void
  onOpenCreateFolder?: (parentId?: string) => void
  onEditFolder?: (folder: {
    id: string
    name: string
    description?: string | null
  }) => void
  onSelectFolderToDelete: (folder: FolderToDelete) => void
}

function FolderTreeItem({
  node,
  level = 0,
  expandedFolderIds,
  onToggleFolder,
  onOpenCreateSet,
  onOpenCreateFolder,
  onEditFolder,
  onSelectFolderToDelete,
}: FolderTreeItemProps) {
  const router = useRouter()
  const isExpanded = expandedFolderIds.has(node.id)

  return (
    <SidebarMenuItem>
      <div className={cn("flex w-full items-center", level > 0 && "pl-2")}>
        <button
          type="button"
          onClick={(e) => onToggleFolder(node.id, e)}
          aria-label={isExpanded ? "Thu gọn thư mục" : "Mở rộng thư mục"}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>

        <SidebarMenuButton
          onClick={() => router.push(`/library?folderId=${node.id}`)}
          className="flex-1 cursor-pointer pr-10"
        >
          {isExpanded ? (
            <FolderOpen className="size-4 shrink-0 text-blue-500" />
          ) : (
            <Folder className="size-4 shrink-0 text-blue-500" />
          )}
          <span className="truncate">{node.name}</span>
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuAction
                showOnHover
                className="aria-expanded:bg-muted"
                aria-label="Tùy chọn thư mục"
              />
            }
          >
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" side="right" align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => onOpenCreateSet?.(node.id)}
                className="cursor-pointer gap-2"
              >
                <Plus className="text-primary size-4" />
                <span>Tạo bộ thẻ ở đây</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onOpenCreateFolder?.(node.id)}
                className="cursor-pointer gap-2"
              >
                <FolderPlus className="size-4 text-blue-500" />
                <span>Tạo thư mục con</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onEditFolder?.({
                    id: node.id,
                    name: node.name,
                    description: node.description,
                  })
                }
                className="cursor-pointer gap-2"
              >
                <Edit2 className="size-4" />
                <span>Đổi tên / sửa</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  onSelectFolderToDelete({ id: node.id, name: node.name })
                }
                className="cursor-pointer gap-2"
              >
                <Trash2 className="size-4" />
                <span>Xoá thư mục</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Subfolders & StudySets khi expand */}
      {isExpanded && (
        <SidebarMenuSub className="mr-0 pr-0">
          {node.children?.map((child) => (
            <FolderTreeItem
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
            <SidebarMenuSubItem key={set.id}>
              <SidebarMenuSubButton render={<Link href={`/sets/${set.id}`} />}>
                <BookOpen className="text-primary/70 size-3.5 shrink-0" />
                <span className="truncate">{set.name}</span>
                <span className="text-muted-foreground ml-auto text-[10px]">
                  {set.cardCount}
                </span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

export function NavFolders({
  onOpenCreateSet,
  onOpenCreateFolder,
  onEditFolder,
}: NavFoldersProps) {
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
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between px-2 pb-1">
        <SidebarGroupLabel className="p-0">Thư mục học tập</SidebarGroupLabel>
        <button
          type="button"
          onClick={() => onOpenCreateFolder?.()}
          title="Tạo thư mục mới"
          className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded p-1 transition-colors"
        >
          <Plus className="size-3.5" />
          <span className="sr-only">Tạo thư mục mới</span>
        </button>
      </div>

      <SidebarMenu>
        {loadingFolders ? (
          <div className="text-muted-foreground px-2 py-1.5 text-xs">
            Đang tải thư mục...
          </div>
        ) : folders.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-1.5 px-2 py-3 text-center text-xs">
            <span>Chưa có thư mục nào.</span>
            <button
              type="button"
              onClick={() => onOpenCreateFolder?.()}
              className="text-primary cursor-pointer font-medium hover:underline"
            >
              + Tạo thư mục đầu tiên
            </button>
          </div>
        ) : (
          folders.map((node) => (
            <FolderTreeItem
              key={node.id}
              node={node}
              expandedFolderIds={expandedFolderIds}
              onToggleFolder={toggleFolder}
              onOpenCreateSet={onOpenCreateSet}
              onOpenCreateFolder={onOpenCreateFolder}
              onEditFolder={onEditFolder}
              onSelectFolderToDelete={setFolderToDelete}
            />
          ))
        )}
      </SidebarMenu>

      <SidebarDeleteDialog
        folderToDelete={folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirmDelete={confirmDeleteFolder}
      />
    </SidebarGroup>
  )
}
