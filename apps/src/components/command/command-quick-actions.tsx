"use client"

import * as React from "react"
import {
  Plus,
  Folder,
  Layers,
  Tag,
  Calendar,
  BarChart2,
  Sparkles,
} from "lucide-react"
import { cn } from "cn"

interface QuickActionButtonProps {
  label: string
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
  onClick: () => void
}

function QuickActionButton({
  label,
  icon: Icon,
  iconClass,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg",
          iconClass
        )}
      >
        <Icon className="size-4" />
      </div>
      <span>{label}</span>
    </button>
  )
}

interface CommandQuickActionsProps {
  onSelect: (url: string) => void
  onOpenCreateSet?: () => void
  onOpenCreateFolder?: () => void
}

export function CommandQuickActions({
  onSelect,
  onOpenCreateSet,
  onOpenCreateFolder,
}: CommandQuickActionsProps) {
  const staticActions = React.useMemo(
    () => [
      {
        label: "Thư viện bộ thẻ",
        icon: Layers,
        iconClass: "bg-indigo-500/10 text-indigo-500",
        onClick: () => onSelect("/library"),
      },
      {
        label: "Quản lý nhãn",
        icon: Tag,
        iconClass: "bg-amber-500/10 text-amber-500",
        onClick: () => onSelect("/tags"),
      },
      {
        label: "Lịch ôn tập",
        icon: Calendar,
        iconClass: "bg-emerald-500/10 text-emerald-500",
        onClick: () => onSelect("/calendar"),
      },
      {
        label: "Thống kê tiến độ",
        icon: BarChart2,
        iconClass: "bg-rose-500/10 text-rose-500",
        onClick: () => onSelect("/stats"),
      },
      {
        label: "Nhập / Xuất dữ liệu",
        icon: Sparkles,
        iconClass: "bg-teal-500/10 text-teal-500",
        onClick: () => onSelect("/import-export"),
      },
    ],
    [onSelect]
  )

  return (
    <div>
      <div className="text-muted-foreground px-2 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
        Thao tác nhanh
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {onOpenCreateSet && (
          <QuickActionButton
            label="Tạo bộ thẻ mới"
            icon={Plus}
            iconClass="bg-primary/10 text-primary"
            onClick={onOpenCreateSet}
          />
        )}
        {onOpenCreateFolder && (
          <QuickActionButton
            label="Tạo thư mục mới"
            icon={Folder}
            iconClass="bg-blue-500/10 text-blue-500"
            onClick={onOpenCreateFolder}
          />
        )}
        {staticActions.map((action) => (
          <QuickActionButton
            key={action.label}
            label={action.label}
            icon={action.icon}
            iconClass={action.iconClass}
            onClick={action.onClick}
          />
        ))}
      </div>
    </div>
  )
}
