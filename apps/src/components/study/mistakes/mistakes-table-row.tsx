"use client"

import * as React from "react"
import Link from "next/link"
import { Volume2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { MistakeCard } from "@/types/mistakes"

export interface MistakesTableRowProps {
  item: MistakeCard
  index: number
  onSpeak: (term: string) => void
}

export function MistakesTableRow({
  item,
  index,
  onSpeak,
}: MistakesTableRowProps) {
  const totalAttempts =
    item.stats?.totalAttempts ??
    item.srsData.correctCount + item.srsData.incorrectCount
  const accuracy =
    item.stats?.accuracy ??
    (totalAttempts > 0
      ? Math.round((item.srsData.correctCount / totalAttempts) * 100)
      : 0)

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="text-muted-foreground text-center text-xs font-medium">
        {index + 1}
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <div className="text-foreground text-sm font-bold">{item.term}</div>
            {item.reading && (
              <div className="text-muted-foreground text-xs font-medium">
                {item.reading}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSpeak(item.term)}
            className="size-7 rounded-lg"
            title="Nghe phát âm"
          >
            <Volume2 className="size-3.5 text-blue-500" />
          </Button>
        </div>
      </TableCell>

      <TableCell>
        <span className="text-foreground text-xs font-medium">
          {item.definition}
        </span>
      </TableCell>

      <TableCell>
        {item.studySet ? (
          <Link
            href={`/sets/${item.studySet.id}`}
            className="hover:text-primary text-muted-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <BookOpen className="size-3" />
            <span>{item.studySet.name}</span>
          </Link>
        ) : (
          <span className="text-muted-foreground text-xs">Tự do</span>
        )}
      </TableCell>

      <TableCell className="text-center">
        <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-black text-rose-600 dark:text-rose-400">
          {item.srsData.incorrectCount} lần
        </span>
      </TableCell>

      <TableCell className="text-center">
        <div className="inline-flex items-center gap-1.5">
          <div className="bg-muted h-1.5 w-12 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full",
                accuracy >= 70
                  ? "bg-emerald-500"
                  : accuracy >= 40
                    ? "bg-amber-500"
                    : "bg-rose-500"
              )}
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <span className="text-[11px] font-bold">{accuracy}%</span>
        </div>
      </TableCell>

      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSpeak(item.term)}
          className="h-8 gap-1 rounded-xl text-xs"
        >
          <Volume2 className="size-3.5" />
          <span>Nghe</span>
        </Button>
      </TableCell>
    </TableRow>
  )
}
