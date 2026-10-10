"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"

export function BackupFullCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="text-primary size-5" />
          Sao lưu toàn bộ dữ liệu (Full Backup)
        </CardTitle>
        <CardDescription>
          Tải về toàn bộ cơ sở dữ liệu học tập cá nhân bao gồm: tất cả thư mục,
          bộ thẻ, thẻ, tiến độ SRS, lịch sử phiên học, thống kê hàng ngày và mục
          tiêu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-primary/20 bg-primary/5 flex flex-col items-start justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <div className="text-foreground text-sm font-semibold">
              Bản sao lưu hoàn chỉnh (.json)
            </div>
            <div className="text-muted-foreground text-xs">
              An toàn, toàn vẹn 100%, có thể khôi phục lại bất kỳ lúc nào trên
              mọi máy tính.
            </div>
          </div>
          <a
            href="/api/export/backup"
            download
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Download data-icon="inline-start" />
            <span>Tải bản sao lưu toàn bộ</span>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
