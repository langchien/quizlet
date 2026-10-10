import { LoginBodySchema, type LoginBody } from "@/schemas/auth"
import { useAuthStore } from "@/stores/useAuthStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function useLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<LoginBody>({
    resolver: zodResolver(LoginBodySchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form

  const toggleShowPassword = React.useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  // Đăng nhập
  const onSubmit = async (data: LoginBody) => {
    try {
      await login(data)
      toast.success("Đăng nhập thành công!", {
        description: "Chào mừng bạn quay trở lại với NihoMemo.",
        icon: React.createElement(CheckCircle2, {
          className: "size-4 text-emerald-500",
        }),
      })
      router.push(callbackUrl)
      router.refresh()
    } catch (err: unknown) {
      const errObj = err as { error?: string; message?: string } | undefined
      const errorMsg =
        errObj?.error ||
        errObj?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại."
      toast.error("Lỗi đăng nhập", {
        description: errorMsg,
      })
    }
  }

  // Điền nhanh tài khoản Admin demo
  const fillAdminAccount = React.useCallback(() => {
    setValue("email", "admin@nihomemo.local", { shouldValidate: true })
    setValue("password", "admin123456", { shouldValidate: true })
    toast.info("Đã điền tài khoản Quản trị viên thử nghiệm", {
      description: "Nhấn 'Đăng nhập' để tiếp tục.",
    })
  }, [setValue])

  return {
    form,
    register,
    errors,
    isLoading,
    showPassword,
    toggleShowPassword,
    fillAdminAccount,
    handleSubmit: handleSubmit(onSubmit),
  }
}
