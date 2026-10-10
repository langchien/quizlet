"use client"

import * as React from "react"
import { Brain } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { DashboardStats } from "@/types/dashboard"

export interface ModeAccuracyChartProps {
  data: DashboardStats["modeAccuracies"]
  hasData: boolean
  formatAccuracyTooltip: (val: unknown) => [string, string]
  formatModeTick: (val: string) => string
  formatModeLabel: (label: unknown) => string
}

export function ModeAccuracyChart({
  data,
  hasData,
  formatAccuracyTooltip,
  formatModeTick,
  formatModeLabel,
}: ModeAccuracyChartProps) {
  return (
    <div className="border-border bg-card flex flex-col rounded-2xl border p-5 shadow-2xs">
      <div className="pb-4">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
          <Brain className="size-4 text-purple-500" />
          <span>Hiệu suất theo chế độ</span>
        </h3>
        <p className="text-muted-foreground text-xs">
          Tỷ lệ chính xác bình quân từng dạng học
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="mode"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                tickFormatter={formatModeTick}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
                formatter={formatAccuracyTooltip}
                labelFormatter={formatModeLabel}
              />
              <Bar
                dataKey="accuracy"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center px-4 text-center text-xs">
            Hãy hoàn thành ít nhất 1 phiên học để xem phân tích hiệu suất từng
            chế độ!
          </div>
        )}
      </div>
    </div>
  )
}
