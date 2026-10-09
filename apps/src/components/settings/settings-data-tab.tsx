"use client"

import * as React from "react"
import Link from "next/link"
import { Download, ExternalLink, AlertCircle } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SettingsDataTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sao lưu & Quản lý dữ liệu</CardTitle>
        <CardDescription>
          Xuất file sao lưu đầy đủ toàn bộ bộ thẻ, lịch sử học tập và khôi phục
          khi cần thiết.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="border-border/70 bg-card hover:border-primary/50 flex flex-col items-start justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h4 className="text-foreground text-sm font-semibold">
              Tải về bản sao lưu toàn bộ (Full Backup JSON)
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Bao gồm toàn bộ bộ thẻ, thẻ vựng, dữ liệu lặp lại ngắt quãng
              (SRS), và nhật ký học tập.
            </p>
          </div>
          <a
            href="/api/export/backup"
            download="nihomemo-backup.json"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 cursor-pointer gap-2"
            )}
          >
            <Download className="size-4" />
            <span>Tải file backup</span>
          </a>
        </div>

        <div className="border-border/70 bg-card hover:border-primary/50 flex flex-col items-start justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h4 className="text-foreground text-sm font-semibold">
              Trung tâm Nhập & Xuất dữ liệu đa định dạng
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Hỗ trợ nhập bộ thẻ từ Anki (.apkg), file CSV/Excel, JSON và khôi
              phục dữ liệu từ bản sao lưu.
            </p>
          </div>
          <Link
            href="/import-export"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0 gap-2")}
          >
            <ExternalLink className="size-4" />
            <span>Mở trang Nhập / Xuất</span>
          </Link>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 border-t py-3">
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            Khuyên bạn nên tạo bản sao lưu định kỳ hàng tuần để bảo vệ lộ trình
            học tập của mình.
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
