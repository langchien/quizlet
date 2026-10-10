"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AnkiFieldMapping, AnkiPreviewDeck } from "@/schemas/import-export"

export type AnkiPreviewCard = AnkiPreviewDeck["sampleCards"][number]

interface AnkiPreviewTableProps {
  sampleCards: AnkiPreviewCard[]
  fieldMapping: AnkiFieldMapping
}

export function AnkiPreviewTable({
  sampleCards,
  fieldMapping,
}: AnkiPreviewTableProps) {
  if (sampleCards.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground text-xs font-semibold">
        Xem trước dữ liệu mẫu ({sampleCards.length} thẻ đầu tiên):
      </div>
      <div className="border-border overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center text-xs">#</TableHead>
              <TableHead className="text-xs">Thuật ngữ (Term)</TableHead>
              <TableHead className="text-xs">Cách đọc (Reading)</TableHead>
              <TableHead className="text-xs">Định nghĩa (Definition)</TableHead>
              <TableHead className="text-xs">Ví dụ (Example)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleCards.map((sc, i) => (
              <TableRow key={i}>
                <TableCell className="text-muted-foreground text-center font-mono text-xs">
                  {i + 1}
                </TableCell>
                <TableCell className="text-xs font-semibold">
                  {sc.rawFields[fieldMapping.term || ""] || sc.term}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {sc.rawFields[fieldMapping.reading || ""] ||
                    sc.reading ||
                    "—"}
                </TableCell>
                <TableCell className="text-xs">
                  {sc.rawFields[fieldMapping.definition || ""] || sc.definition}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate text-xs">
                  {sc.rawFields[fieldMapping.example || ""] || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
