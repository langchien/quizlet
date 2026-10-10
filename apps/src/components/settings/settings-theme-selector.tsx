"use client"

import * as React from "react"
import { Sun, Moon, Laptop, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SettingsThemeSelectorProps {
  theme: string | undefined
  onThemeChange: (theme: string) => void
}

interface ThemeOption {
  value: "light" | "dark" | "system"
  label: string
  icon: LucideIcon
  iconColor: string
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Chế độ Sáng",
    icon: Sun,
    iconColor: "text-amber-500",
  },
  {
    value: "dark",
    label: "Chế độ Tối",
    icon: Moon,
    iconColor: "text-primary",
  },
  {
    value: "system",
    label: "Theo Hệ thống",
    icon: Laptop,
    iconColor: "text-muted-foreground",
  },
]

export function SettingsThemeSelector({
  theme,
  onThemeChange,
}: SettingsThemeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {THEME_OPTIONS.map((item) => {
        const Icon = item.icon
        const isSelected = theme === item.value

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onThemeChange(item.value)}
            className={cn(
              "border-border hover:bg-muted/50 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
              isSelected && "border-primary bg-primary/5 ring-primary/20 ring-2"
            )}
          >
            <Icon className={cn("size-6", item.iconColor)} />
            <span className="text-foreground text-xs font-semibold">
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
