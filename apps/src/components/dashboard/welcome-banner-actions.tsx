"use client"

import * as React from "react"
import Link from "next/link"
import { Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WelcomeBannerActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        render={<Link href="/calendar" />}
        variant="outline"
        className="rounded-xl text-xs"
      >
        <Clock data-icon="inline-start" className="size-3.5" />
        <span>Xem lịch ôn tập</span>
      </Button>

      <Button
        render={<Link href="/library" />}
        className="rounded-xl text-xs shadow-xs"
      >
        <Plus data-icon="inline-start" className="size-3.5" />
        <span>Tạo bộ thẻ mới</span>
      </Button>
    </div>
  )
}
