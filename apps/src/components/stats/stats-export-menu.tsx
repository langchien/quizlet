"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface StatsExportMenuProps {
  onExport: () => void
  disabled?: boolean
}

/**
 * Component nút kích hoạt xuất báo cáo dữ liệu thống kê định dạng JSON
 */
export function StatsExportMenu({ onExport, disabled }: StatsExportMenuProps) {
  return (
    <Button
      onClick={onExport}
      disabled={disabled}
      variant="outline"
      size="sm"
      className="self-start rounded-xl text-xs shadow-2xs sm:self-auto"
    >
      <Download data-icon="inline-start" className="size-4" />
      <span>Xuất dữ liệu JSON</span>
    </Button>
  )
}
