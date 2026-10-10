"use client"

import * as React from "react"
import { DAY_NAMES } from "@/types/calendar"

export interface ForecastItem {
  date: string
  dueCount: number
}

export interface FormattedForecastItem extends ForecastItem {
  dayLabel: string
  dateShort: string
  isToday: boolean
}

export interface UseCalendarForecastProps {
  forecast?: ForecastItem[]
}

/**
 * Hook xử lý logic tính toán và định dạng dữ liệu dự báo 7 ngày
 */
export function useCalendarForecast({
  forecast = [],
}: UseCalendarForecastProps) {
  const totalForecastCount = React.useMemo(() => {
    return forecast.reduce((acc, f) => acc + f.dueCount, 0)
  }, [forecast])

  const formattedItems = React.useMemo<FormattedForecastItem[]>(() => {
    return forecast.map((item, idx) => {
      const d = new Date(item.date)
      const dayLabel = DAY_NAMES[d.getDay()] || ""
      return {
        ...item,
        dayLabel,
        dateShort: item.date.slice(5),
        isToday: idx === 0,
      }
    })
  }, [forecast])

  return {
    totalForecastCount,
    formattedItems,
    hasForecast: forecast.length > 0,
  }
}
