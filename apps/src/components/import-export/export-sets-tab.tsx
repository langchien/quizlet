"use client"

import * as React from "react"
import { Layers, Download } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExportSetRow } from "./export-set-row"
import { cn } from "cn"
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
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download data-icon="inline-start" />
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
              <ExportSetRow key={set.id} set={set} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
