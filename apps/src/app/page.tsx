"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAppStore } from "@/stores/useAppStore"
import { useAuthStore } from "@/stores/useAuthStore"
import type { HealthCheckResponse } from "@/types"
import {
  LandingHeader,
  LandingHero,
  LandingDbStatus,
  LandingJlptSelector,
  LandingStudyModes,
  LandingTechStack,
  LandingFooter,
} from "@/components/landing"

async function fetchHealth(): Promise<HealthCheckResponse> {
  const res = await fetch("/api/health")
  if (!res.ok) {
    throw new Error("Không thể kết nối đến Database")
  }
  return res.json()
}

export default function HomePage() {
  const { selectedJLPTLevel, setSelectedJLPTLevel } = useAppStore()
  const { user, isAuthenticated, fetchCurrentUser, logout, isLoading } =
    useAuthStore()

  React.useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const {
    data: health,
    isLoading: loadingHealth,
    refetch,
  } = useQuery({
    queryKey: ["healthCheck"],
    queryFn: fetchHealth,
  })

  const handleManualCheck = async () => {
    const result = await refetch()
    if (result.data?.status === "ok" && result.data?.database === "connected") {
      toast.success("Kết nối PostgreSQL qua Prisma thành công!", {
        description: `Trạng thái: ${result.data.status} | DB: ${result.data.database}`,
      })
    } else {
      toast.error("Lỗi kết nối cơ sở dữ liệu")
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Đã đăng xuất tài khoản thành công")
    } catch {
      toast.error("Đăng xuất thất bại")
    }
  }

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 relative flex min-h-screen flex-col">
      {/* Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-20" />

      {/* Navigation Top Bar */}
      <LandingHeader
        user={user}
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <LandingHero user={user} isAuthenticated={isAuthenticated} />

        <LandingDbStatus
          health={health}
          loadingHealth={loadingHealth}
          onManualCheck={handleManualCheck}
        />

        <LandingJlptSelector
          selectedLevel={selectedJLPTLevel}
          onSelectLevel={setSelectedJLPTLevel}
        />

        <LandingStudyModes />

        <LandingTechStack />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
