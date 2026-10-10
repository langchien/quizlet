"use client"

import * as React from "react"
import { Database, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HealthCheckResponse } from "@/types"

interface LandingDbStatusProps {
  health?: HealthCheckResponse
  loadingHealth: boolean
  onManualCheck: () => void
}

export function LandingDbStatus({
  health,
  loadingHealth,
  onManualCheck,
}: LandingDbStatusProps) {
  const isConnected = health?.database === "connected"

  return (
    <div className="border-border/60 bg-card shadow-foreground/5 mt-8 w-full max-w-md rounded-2xl border p-6 text-left shadow-xl">
      <div className="border-border/50 flex items-center justify-between border-b pb-4">
        <div className="text-foreground flex items-center gap-2 font-medium">
          <Database className="size-4 text-emerald-500" />
          <span>Trạng thái kết nối</span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isConnected
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isConnected ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {isConnected
            ? "Đã kết nối PostgreSQL"
            : loadingHealth
              ? "Đang tải dữ liệu..."
              : "Chưa kết nối"}
        </span>
      </div>

      <div className="text-muted-foreground mt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span>API Endpoint:</span>
          <code className="text-foreground font-mono text-xs">/api/health</code>
        </div>
        <div className="flex justify-between">
          <span>Database:</span>
          <span className="text-foreground">PostgreSQL 15 (Docker: 54321)</span>
        </div>
        <div className="flex justify-between">
          <span>ORM:</span>
          <span className="text-foreground">Prisma v7 (adapter-pg)</span>
        </div>
        <div className="flex justify-between">
          <span>Thời gian phản hồi:</span>
          <span className="text-foreground">
            {health?.timestamp
              ? new Date(health.timestamp).toLocaleTimeString()
              : "--"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onManualCheck}
          disabled={loadingHealth}
        >
          <Zap className="mr-1.5 size-3.5" />
          {loadingHealth ? "Đang kiểm tra..." : "Kiểm tra lại"}
        </Button>
      </div>
    </div>
  )
}
