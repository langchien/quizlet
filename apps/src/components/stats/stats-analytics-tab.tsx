"use client"

import * as React from "react"
import { TrendingUp, Brain, Layers, Loader2 } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { Button } from "@/components/ui/button"
import type { DailyStatsResponse } from "@/schemas/stats"

interface StatsAnalyticsTabProps {
  dailyStats: DailyStatsResponse[]
  timeRange: string
  isDailyPending: boolean
  onTimeRangeChange: (range: string) => void
  srsDistribution: { name: string; value: number; color: string }[]
  topSets: { name: string; count: number }[]
}

export function StatsAnalyticsTab({
  dailyStats,
  timeRange,
  isDailyPending,
  onTimeRangeChange,
  srsDistribution,
  topSets,
}: StatsAnalyticsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Bộ lọc khoảng thời gian */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
          <TrendingUp className="text-primary size-4" />
          <span>Biểu đồ tiến độ chi tiết</span>
          {isDailyPending && (
            <Loader2 className="text-primary size-4 animate-spin" />
          )}
        </h3>

        <div className="bg-muted/50 border-border flex items-center gap-1.5 rounded-xl border p-1">
          {[
            { label: "7 ngày", val: "7" },
            { label: "30 ngày", val: "30" },
            { label: "90 ngày", val: "90" },
            { label: "Tất cả", val: "all" },
          ].map((item) => (
            <Button
              key={item.val}
              variant={timeRange === item.val ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onTimeRangeChange(item.val)}
              disabled={isDailyPending}
              className="h-7 rounded-lg px-2.5 text-[11px] font-semibold"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Biểu đồ hoạt động theo ngày */}
      <div className="border-border bg-card rounded-3xl border p-6 shadow-2xs">
        <h4 className="text-foreground mb-1 text-sm font-bold">
          Số thẻ học & Độ chính xác theo ngày
        </h4>
        <p className="text-muted-foreground mb-4 text-xs">
          Theo dõi số thẻ hoàn thành và tỷ lệ chính xác
        </p>

        <div
          className={`h-72 w-full transition-opacity ${isDailyPending ? "opacity-50" : ""}`}
        >
          {dailyStats && dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyStats}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="studiedGradient"
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
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(d) => d.slice(5)}
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
                  }}
                  formatter={(value: unknown, name: unknown) => [
                    name === "cardsStudied"
                      ? `${value} thẻ`
                      : name === "cardsCorrect"
                        ? `${value} đúng`
                        : `${value}%`,
                    name === "cardsStudied"
                      ? "Tổng số thẻ"
                      : name === "cardsCorrect"
                        ? "Thẻ đúng"
                        : "Độ chính xác",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cardsStudied"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#studiedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              Chưa có dữ liệu học tập trong khoảng thời gian này.
            </div>
          )}
        </div>
      </div>

      {/* Grid 2 Biểu đồ: Phân bố SRS Donut & Top Sets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Biểu đồ Donut Phân bố SRS */}
        <div className="border-border bg-card flex flex-col justify-between rounded-3xl border p-6 shadow-2xs">
          <div>
            <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <Brain className="size-4 text-purple-500" />
              <span>Phân bố trạng thái Spaced Repetition</span>
            </h4>
            <p className="text-muted-foreground mt-1 text-xs">
              Mức độ thuần thục của toàn bộ thẻ từ vựng
            </p>
          </div>

          <div className="my-3 h-64 w-full">
            {srsDistribution &&
            srsDistribution.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={srsDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {srsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                    formatter={(val: unknown) => [`${val} thẻ`, "Số lượng"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val) => (
                      <span className="text-foreground text-xs font-medium">
                        {val}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                Chưa có dữ liệu SRS.
              </div>
            )}
          </div>
        </div>

        {/* Biểu đồ Bar Top Bộ thẻ */}
        <div className="border-border bg-card flex flex-col justify-between rounded-3xl border p-6 shadow-2xs">
          <div>
            <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <Layers className="size-4 text-blue-500" />
              <span>Top bộ thẻ quy mô lớn nhất</span>
            </h4>
            <p className="text-muted-foreground mt-1 text-xs">
              Số lượng thẻ trong các bộ thẻ hàng đầu
            </p>
          </div>

          <div className="my-3 h-64 w-full">
            {topSets && topSets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSets}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    type="number"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    width={90}
                    tickFormatter={(v) =>
                      v.length > 12 ? `${v.slice(0, 12)}...` : v
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                    formatter={(val: unknown) => [`${val} thẻ`, "Quy mô"]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                Chưa có bộ thẻ nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
