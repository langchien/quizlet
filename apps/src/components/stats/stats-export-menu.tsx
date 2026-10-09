"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatsExportMenuProps {
  onExport: () => void
  disabled?: boolean
}

export function StatsExportMenu({ onExport, disabled }: StatsExportMenuProps) {
  return (
    <Button
      onClick={onExport}
      disabled={disabled}
      variant="outline"
      className="gap-2 self-start rounded-xl text-xs shadow-2xs sm:self-auto"
    >
      <Download className="size-4" />
      <span>Xuất dữ liệu JSON</span>
    </Button>
  )
}
