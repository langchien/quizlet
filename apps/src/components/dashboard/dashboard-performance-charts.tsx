"use client"

import * as React from "react"
import Link from "next/link"
import { TrendingUp, Brain, ArrowRight } from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { STUDY_MODE_LABELS, type DashboardStats } from "@/types/dashboard"

interface DashboardPerformanceChartsProps {
  weeklyChart?: DashboardStats["weeklyChart"]
  modeAccuracies?: DashboardStats["modeAccuracies"]
}

export function DashboardPerformanceCharts({
  weeklyChart,
  modeAccuracies,
}: DashboardPerformanceChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Biểu đồ hoạt động 7 ngày (2 Cột) */}
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
          {weeklyChart && weeklyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyChart}
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
                  formatter={(value: unknown) => [`${value} thẻ`, "Đã học"]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return `${payload[0].payload.dayName} (${payload[0].payload.date})`
                    }
                    return label
                  }}
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

      {/* Biểu đồ độ chính xác theo Study Mode (1 Cột) */}
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
          {modeAccuracies && modeAccuracies.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modeAccuracies}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="mode"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => STUDY_MODE_LABELS[val]?.label || val}
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
                  formatter={(val: unknown) => [`${val}%`, "Độ chính xác"]}
                  labelFormatter={(label) => {
                    const key =
                      typeof label === "string" ? label : String(label)
                    return STUDY_MODE_LABELS[key]?.label || key
                  }}
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
    </div>
  )
}
