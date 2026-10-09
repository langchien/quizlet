"use client"

import * as React from "react"
import { Layers, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { UserSetSummary } from "@/hooks/import-export/use-export-sets"

interface ExportSetsTabProps {
  userSets: UserSetSummary[]
  loadingSets: boolean
}

export function ExportSetsTab({ userSets, loadingSets }: ExportSetsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="text-primary size-5" />
              Xuất các bộ thẻ học tập (Export Sets)
            </CardTitle>
            <CardDescription>
              Tải về từng bộ thẻ hoặc xuất toàn bộ thư viện dưới định dạng JSON
              hoặc CSV.
            </CardDescription>
          </div>
          <a
            href="/api/export/all"
            download
            className="bg-muted hover:bg-muted/80 text-foreground flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Download className="size-3.5" />
            <span>Xuất tất cả bộ thẻ (.json)</span>
          </a>
        </div>
      </CardHeader>
      <CardContent>
        {loadingSets ? (
          <div className="text-muted-foreground py-6 text-center text-xs">
            Đang tải danh sách bộ thẻ...
          </div>
        ) : userSets.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center text-xs">
            Chưa có bộ thẻ nào trong thư viện.
          </div>
        ) : (
          <div className="border-border divide-border/60 divide-y rounded-xl border">
            {userSets.map((set) => (
              <div
                key={set.id}
                className="hover:bg-muted/30 flex items-center justify-between p-3 text-xs transition-colors"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-foreground truncate font-semibold">
                    {set.name}
                  </span>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {set.cardCount} thẻ
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={`/api/export/set/${set.id}?format=json`}
                    download
                    className="hover:bg-primary/10 hover:text-primary rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
                    title="Tải về định dạng JSON"
                  >
                    JSON
                  </a>
                  <a
                    href={`/api/export/set/${set.id}?format=csv`}
                    download
                    className="hover:bg-primary/10 hover:text-primary rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
                    title="Tải về định dạng CSV"
                  >
                    CSV
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
