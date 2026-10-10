"use client"

import * as React from "react"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/useAuthStore"

/**
 * Hook quản lý trạng thái xác thực và xử lý đăng xuất ở Landing Page
 */
export function useLandingAuth() {
  const { user, isAuthenticated, fetchCurrentUser, logout, isLoading } =
    useAuthStore()

  React.useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const handleLogout = React.useCallback(async () => {
    try {
      await logout()
      toast.success("Đã đăng xuất tài khoản thành công")
    } catch {
      toast.error("Đăng xuất thất bại")
    }
  }, [logout])

  return {
    user,
    isAuthenticated,
    isLoading,
    handleLogout,
  }
}

export type UseLandingAuthReturn = ReturnType<typeof useLandingAuth>
