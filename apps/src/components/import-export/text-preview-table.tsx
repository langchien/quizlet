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

export interface PreviewTextCard {
  term: string
  reading: string
  definition: string
}

interface TextPreviewTableProps {
  cards: PreviewTextCard[]
}

export function TextPreviewTable({ cards }: TextPreviewTableProps) {
  if (cards.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground text-xs font-semibold">
        Xem trước ({cards.length} thẻ được nhận diện):
      </div>
      <div className="border-border overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center text-xs">#</TableHead>
              <TableHead className="text-xs">Từ vựng (Term)</TableHead>
              <TableHead className="text-xs">Cách đọc (Reading)</TableHead>
              <TableHead className="text-xs">Định nghĩa (Definition)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((c, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-muted-foreground text-center font-mono text-xs">
                  {idx + 1}
                </TableCell>
                <TableCell className="text-xs font-semibold">
                  {c.term}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {c.reading}
                </TableCell>
                <TableCell className="text-xs">{c.definition}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
