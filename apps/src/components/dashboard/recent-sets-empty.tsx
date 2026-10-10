"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, Plus } from "lucide-react"
import {
  Empty,
  EmptyMedia,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export function RecentSetsEmpty() {
  return (
    <Empty className="border-border rounded-2xl border border-dashed py-10">
      <EmptyMedia>
        <BookOpen className="text-muted-foreground size-8 opacity-40" />
      </EmptyMedia>
      <EmptyDescription className="text-muted-foreground text-xs">
        Bạn chưa có bộ thẻ nào. Hãy tạo bộ thẻ đầu tiên để bắt đầu học!
      </EmptyDescription>
      <EmptyContent className="mt-1">
        <Button
          render={<Link href="/library" />}
          size="sm"
          className="rounded-xl text-xs"
        >
          <Plus data-icon="inline-start" className="size-3.5" />
          <span>Tạo bộ thẻ ngay</span>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
