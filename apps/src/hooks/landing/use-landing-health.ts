"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import type { HealthCheckResponse } from "@/types"

async function fetchHealth(): Promise<HealthCheckResponse> {
  const res = await fetch("/api/health")
  if (!res.ok) {
    throw new Error("Không thể kết nối đến Database")
  }
  return res.json()
}

/**
 * Hook quản lý kết nối và trạng thái kiểm tra cơ sở dữ liệu
 */
export function useLandingHealth() {
  const {
    data: health,
    isLoading: loadingHealth,
    refetch,
  } = useQuery({
    queryKey: ["healthCheck"],
    queryFn: fetchHealth,
  })

  const isConnected = health?.database === "connected"

  const handleManualCheck = React.useCallback(async () => {
    const result = await refetch()
    if (result.data?.status === "ok" && result.data?.database === "connected") {
      toast.success("Kết nối PostgreSQL qua Prisma thành công!", {
        description: `Trạng thái: ${result.data.status} | DB: ${result.data.database}`,
      })
    } else {
      toast.error("Lỗi kết nối cơ sở dữ liệu")
    }
  }, [refetch])

  return {
    health,
    loadingHealth,
    isConnected,
    handleManualCheck,
  }
}

export type UseLandingHealthReturn = ReturnType<typeof useLandingHealth>
