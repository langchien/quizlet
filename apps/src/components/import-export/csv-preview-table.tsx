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

interface CsvPreviewTableProps {
  headers: string[]
  rows: string[][]
}

export function CsvPreviewTable({ headers, rows }: CsvPreviewTableProps) {
  if (rows.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground text-xs font-semibold">
        Bảng xem trước dữ liệu (Mẫu {rows.length} dòng):
      </div>
      <div className="border-border overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center text-xs">#</TableHead>
              {headers.map((h, i) => (
                <TableHead key={i} className="text-xs font-semibold">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rIdx) => (
              <TableRow key={rIdx}>
                <TableCell className="text-muted-foreground text-center font-mono text-xs">
                  {rIdx + 1}
                </TableCell>
                {row.map((cell, cIdx) => (
                  <TableCell key={cIdx} className="max-w-xs truncate text-xs">
                    {cell || "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
