"use client"

import * as React from "react"
import Link from "next/link"
import { TrendingUp, ArrowRight } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { DashboardStats } from "@/types/dashboard"

export interface WeeklyProgressChartProps {
  data: DashboardStats["weeklyChart"]
  hasData: boolean
  formatCardsTooltip: (value: unknown) => [string, string]
  formatWeeklyLabel: (
    label: unknown,
    payload?: readonly { payload?: { dayName?: string; date?: string } }[]
  ) => string
}

export function WeeklyProgressChart({
  data,
  hasData,
  formatCardsTooltip,
  formatWeeklyLabel,
}: WeeklyProgressChartProps) {
  return (
    <div className="border-border bg-card flex flex-col rounded-2xl border p-5 shadow-2xs lg:col-span-2">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <TrendingUp className="text-primary size-4" />
            <span>Tiến độ học tập 7 ngày qua</span>
          </h3>
          <p className="text-muted-foreground text-xs">
            Số lượng thẻ từ vựng đã ôn tập mỗi ngày
          </p>
        </div>
        <Link
          href="/stats"
          className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="h-64 w-full pt-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="dashboardCardGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="dayName"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "var(--foreground)",
                }}
                formatter={formatCardsTooltip}
                labelFormatter={formatWeeklyLabel}
              />
              <Area
                type="monotone"
                dataKey="cardsStudied"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#dashboardCardGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            Chưa có dữ liệu học tập trong tuần này.
          </div>
        )}
      </div>
    </div>
  )
}
