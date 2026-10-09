"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Library,
  Tag,
  Calendar,
  BarChart3,
  Settings,
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
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { FolderNode } from "@/app/api/folders/route"

interface SidebarProps {
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

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onOpenCreateSet,
  onOpenCreateFolder,
  onEditFolder,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [folders, setFolders] = React.useState<FolderNode[]>([])
  const [expandedFolderIds, setExpandedFolderIds] = React.useState<Set<string>>(
    new Set()
  )
  const [loadingFolders, setLoadingFolders] = React.useState(true)

  const fetchFolders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/folders")
      if (res.ok) {
        const data = await res.json()
        setFolders(data)
      }
    } catch (err) {
      console.error("Error fetching folders:", err)
    } finally {
      setLoadingFolders(false)
    }
  }, [])

  React.useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const toggleFolder = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedFolderIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDeleteFolder = async (id: string, name: string) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xoá thư mục "${name}"? Các bộ thẻ bên trong sẽ được chuyển ra thư mục gốc.`
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success(`Đã xoá thư mục "${name}"`)
        fetchFolders()
      } else {
        const json = await res.json()
        toast.error(json.error || "Xoá thư mục thất bại")
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ")
    }
  }

  const navItems = [
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
      title: "Cài đặt",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ]

  // Render cây thư mục đệ quy
  const renderFolderNode = (node: FolderNode, level = 0) => {
    const isExpanded = expandedFolderIds.has(node.id)

    return (
      <div key={node.id} className="select-none">
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
              onClick={(e) => toggleFolder(node.id, e)}
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
              >
                <MoreVertical className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="left" className="w-44">
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
                  destructive
                  onClick={() => handleDeleteFolder(node.id, node.name)}
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
            {node.children?.map((child) => renderFolderNode(child, level + 1))}
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

  return (
    <aside
      className={cn(
        "border-border bg-card/60 relative z-30 flex flex-col border-r backdrop-blur-md transition-all duration-300 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="border-border/60 flex h-16 items-center justify-between border-b px-3">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
            <div className="from-primary flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br to-rose-600 text-base font-bold text-white shadow-sm">
              日
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-bold tracking-tight">
                {APP_NAME}
              </span>
              <span className="text-muted-foreground text-[10px] leading-none">
                日本メモ
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="from-primary flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br to-rose-600 text-lg font-bold text-white shadow-sm">
              日
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "text-muted-foreground hover:bg-muted hover:text-foreground hidden rounded-lg p-1.5 transition-colors md:block",
            collapsed && "mx-auto mt-2"
          )}
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {/* Nav Links */}
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

        {/* Folders Tree Section */}
        {!collapsed && (
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
                folders.map((node) => renderFolderNode(node))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Button in Sidebar */}
      {!collapsed && (
        <div className="border-border/50 border-t p-3">
          <button
            type="button"
            onClick={() => onOpenCreateSet()}
            className="bg-primary/10 hover:bg-primary/20 text-primary flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
          >
            <Plus className="size-4" />
            <span>Tạo bộ thẻ mới</span>
          </button>
        </div>
      )}
    </aside>
  )
}
