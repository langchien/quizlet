"use client"

import * as React from "react"
import { Database, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { HealthCheckResponse } from "@/types"

interface DbStatusBadgeProps {
  isConnected: boolean
  loading: boolean
}

/**
 * Sub-component hiển thị nhãn trạng thái kết nối cơ sở dữ liệu
 */
export function DbStatusBadge({ isConnected, loading }: DbStatusBadgeProps) {
  const statusText = isConnected
    ? "Đã kết nối PostgreSQL"
    : loading
      ? "Đang tải dữ liệu..."
      : "Chưa kết nối"

  return (
    <Badge
      variant={isConnected ? "success" : "warning"}
      className="gap-1.5 px-2.5 py-0.5 font-semibold"
    >
      <span
        className={`size-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {statusText}
    </Badge>
  )
}

interface DbStatusItemProps {
  label: string
  value: React.ReactNode
  isCode?: boolean
}

/**
 * Sub-component hiển thị từng dòng thông tin trạng thái
 */
export function DbStatusItem({
  label,
  value,
  isCode = false,
}: DbStatusItemProps) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      {isCode ? (
        <code className="text-foreground font-mono text-xs">{value}</code>
      ) : (
        <span className="text-foreground">{value}</span>
      )}
    </div>
  )
}

interface DbStatusInfoListProps {
  timestamp?: string
}

/**
 * Sub-component danh sách thông tin cấu hình hệ thống
 */
export function DbStatusInfoList({ timestamp }: DbStatusInfoListProps) {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString()
    : "--"

  return (
    <div className="text-muted-foreground flex flex-col gap-2 text-sm">
      <DbStatusItem label="API Endpoint:" value="/api/health" isCode />
      <DbStatusItem label="Database:" value="PostgreSQL 15 (Docker: 54321)" />
      <DbStatusItem label="ORM:" value="Prisma v7 (adapter-pg)" />
      <DbStatusItem label="Thời gian phản hồi:" value={formattedTime} />
    </div>
  )
}

export interface LandingDbStatusProps {
  health?: HealthCheckResponse
  loadingHealth: boolean
  onManualCheck?: () => void
  handleManualCheck?: () => void
}

export function LandingDbStatus({
  health,
  loadingHealth,
  onManualCheck,
  handleManualCheck,
}: LandingDbStatusProps) {
  const triggerCheck = handleManualCheck ?? onManualCheck
  const isConnected = health?.database === "connected"

  return (
    <Card className="shadow-foreground/5 border-border/60 mt-8 w-full max-w-md shadow-xl">
      <CardHeader className="border-border/50 border-b pb-4">
        <CardTitle className="text-foreground flex items-center gap-2 text-sm font-medium">
          <Database className="size-4 text-emerald-500" />
          <span>Trạng thái kết nối</span>
        </CardTitle>
        <CardAction>
          <DbStatusBadge isConnected={isConnected} loading={loadingHealth} />
        </CardAction>
      </CardHeader>

      <CardContent className="pt-4">
        <DbStatusInfoList timestamp={health?.timestamp} />
      </CardContent>

      <CardFooter className="border-t-0 bg-transparent p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={triggerCheck}
          disabled={loadingHealth}
        >
          <Zap data-icon="inline-start" className="size-3.5" />
          {loadingHealth ? "Đang kiểm tra..." : "Kiểm tra lại"}
        </Button>
      </CardFooter>
    </Card>
  )
}
