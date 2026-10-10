"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useShortcutsSettings } from "@/hooks/settings/use-shortcuts-settings"
import { SettingsShortcutsTable } from "./settings-shortcuts-table"

export interface SettingsShortcutsTabProps {
  keyboardShortcutsEnabled: boolean
  setKeyboardShortcutsEnabled: (enabled: boolean) => void
}

export function SettingsShortcutsTab({
  keyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
}: SettingsShortcutsTabProps) {
  const { handleResetShortcuts } = useShortcutsSettings(
    setKeyboardShortcutsEnabled
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Phím tắt thông minh</CardTitle>
            <CardDescription>
              Tăng tốc độ ôn luyện thẻ và điều hướng hệ thống bằng bàn phím.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Bật phím tắt</span>
            <Switch
              checked={keyboardShortcutsEnabled}
              onCheckedChange={setKeyboardShortcutsEnabled}
              aria-label="Bật phím tắt bàn phím"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SettingsShortcutsTable />

        <div className="flex items-center justify-between pt-2">
          <p className="text-muted-foreground text-xs">
            Nhấn{" "}
            <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono text-[10px]">
              ?
            </kbd>{" "}
            ở bất kỳ đâu để xem cheatsheet phím tắt nhanh.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetShortcuts}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Khôi phục mặc định</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
