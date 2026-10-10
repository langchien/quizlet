"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  LogIn,
  Mail,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginBodySchema, type LoginBody } from "@/schemas/auth"
import { useAuthStore } from "@/stores/useAuthStore"
import { AuthCardWrapper } from "./auth-card-wrapper"
import { PasswordInput } from "./password-input"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const { login, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginBody>({
    resolver: zodResolver(LoginBodySchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Đăng nhập
  const onSubmit = async (data: LoginBody) => {
    try {
      await login(data)
      toast.success("Đăng nhập thành công!", {
        description: "Chào mừng bạn quay trở lại với NihoMemo.",
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
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

  // Điền tài khoản demo Admin nhanh
  const fillAdminAccount = () => {
    setValue("email", "admin@nihomemo.local", { shouldValidate: true })
    setValue("password", "admin123456", { shouldValidate: true })
    toast.info("Đã điền tài khoản Quản trị viên thử nghiệm", {
      description: "Nhấn 'Đăng nhập' để tiếp tục.",
    })
  }

  return (
    <AuthCardWrapper
      icon={<LogIn className="size-6" />}
      title="Đăng nhập NihoMemo"
      description="Tiếp tục lộ trình học từ vựng, Kanji và ngữ pháp tiếng Nhật"
      footerText="Chưa có tài khoản?"
      footerLinkText="Tạo tài khoản mới"
      footerLinkHref="/register"
    >
      {/* Nút Demo Account */}
      <div className="border-primary/20 bg-primary/5 text-primary dark:bg-primary/10 rounded-lg border p-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="text-primary size-3.5" />
            <span>Tài khoản thử nghiệm sẵn sàng:</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={fillAdminAccount}
            className="border-primary/30 hover:bg-primary/20 h-6 text-[11px]"
          >
            Điền nhanh
          </Button>
        </div>
        <div className="text-muted-foreground mt-1 font-mono text-[11px]">
          admin@nihomemo.local / admin123456
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            Địa chỉ Email
          </Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pr-3 pl-9"
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold">
              Mật khẩu
            </Label>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-destructive text-xs font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="shadow-primary/20 w-full gap-2 shadow-md transition-all active:scale-[0.99]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Đang xử lý đăng nhập...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </AuthCardWrapper>
  )
}
