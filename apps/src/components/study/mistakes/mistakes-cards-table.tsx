"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { MistakeCard } from "@/types/mistakes"
import { MistakesTableRow } from "./mistakes-table-row"
import { MistakesTableEmpty } from "./mistakes-table-empty"

interface MistakesCardsTableProps {
  items: MistakeCard[]
  isFilterPending: boolean
  onSpeak: (term: string) => void
}

export function MistakesCardsTable({
  items,
  isFilterPending,
  onSpeak,
}: MistakesCardsTableProps) {
  return (
    <div
      className={cn(
        "border-border bg-card overflow-hidden rounded-3xl border shadow-2xs transition-opacity",
        isFilterPending && "opacity-50"
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center text-xs font-bold">
              #
            </TableHead>
            <TableHead className="text-xs font-bold">Từ vựng</TableHead>
            <TableHead className="text-xs font-bold">Ý nghĩa</TableHead>
            <TableHead className="text-xs font-bold">Bộ thẻ</TableHead>
            <TableHead className="text-center text-xs font-bold">
              Số lần sai
            </TableHead>
            <TableHead className="text-center text-xs font-bold">
              Độ chính xác
            </TableHead>
            <TableHead className="text-right text-xs font-bold">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item, idx) => (
              <MistakesTableRow
                key={item.id}
                item={item}
                index={idx}
                onSpeak={onSpeak}
              />
            ))
          ) : (
            <MistakesTableEmpty />
          )}
        </TableBody>
      </Table>
    </div>
  )
}
