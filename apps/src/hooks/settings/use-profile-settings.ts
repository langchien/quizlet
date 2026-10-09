"use client"

import * as React from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function useProfileSettings() {
  const { user, setUser } = useAuthStore()
  const [name, setName] = React.useState("")
  const [avatar, setAvatar] = React.useState("")
  const [savingProfile, setSavingProfile] = React.useState(false)

  // Đồng bộ thông tin khi user load
  React.useEffect(() => {
    if (user) {
      setName(user.name || "")
      setAvatar(user.avatar || "")
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên hiển thị.")
      return
    }

    setSavingProfile(true)
    try {
      const res = await api.patch("/api/auth/me", {
        name: name.trim(),
        avatar: avatar.trim() || null,
      })
      if (res.data?.user) {
        setUser(res.data.user)
      }
      toast.success("Cập nhật thông tin cá nhân thành công!")
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined
      toast.error(errorMsg || "Không thể cập nhật hồ sơ.")
    } finally {
      setSavingProfile(false)
    }
  }

  return {
    user,
    name,
    setName,
    avatar,
    setAvatar,
    savingProfile,
    handleSaveProfile,
  }
}
