import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: LucideIcon
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border/60 bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      <div className="bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-2xl shadow-inner">
        <Icon className="size-7" />
      </div>
      <h3 className="text-foreground text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm" className="gap-2 shadow-xs">
            {ActionIcon && <ActionIcon className="size-4" />}
            <span>{actionLabel}</span>
          </Button>
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
