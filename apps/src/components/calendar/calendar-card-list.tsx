"use client"

import * as React from "react"
import { CalendarCardItem } from "./calendar-card-item"
import { CalendarDayEmpty } from "./calendar-day-empty"
import type { TodayDueData } from "@/types/calendar"

type DueCard = NonNullable<TodayDueData>["cards"][number]

interface CalendarCardListProps {
  cards: DueCard[]
}

export function CalendarCardList({ cards }: CalendarCardListProps) {
  if (!cards || cards.length === 0) {
    return <CalendarDayEmpty />
  }

  return (
    <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
      {cards.map((card) => (
        <CalendarCardItem key={card.id} card={card} />
      ))}
    </div>
  )
}
