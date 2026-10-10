"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"

export function MistakesTableEmpty() {
  return (
    <TableRow>
      <TableCell
        colSpan={7}
        className="text-muted-foreground py-12 text-center text-xs"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="size-8 text-emerald-500" />
          <p className="text-foreground text-sm font-bold">
            Tuyệt vời! Không có lỗi sai nào.
          </p>
          <p className="text-muted-foreground text-xs">
            Bạn đã hoàn thành tốt các bài học hoặc chưa có dữ liệu sai trong bộ
            lọc này.
          </p>
        </div>
      </TableCell>
    </TableRow>
  )
}
