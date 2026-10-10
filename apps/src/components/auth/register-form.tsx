"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  UserPlus,
  Mail,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RegisterBodySchema, type RegisterBody } from "@/schemas/auth"
import { useAuthStore } from "@/stores/useAuthStore"
import { AuthCardWrapper } from "./auth-card-wrapper"
import { PasswordInput } from "./password-input"

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterBody>({
    resolver: zodResolver(RegisterBodySchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Đăng ký
  const onSubmit = async (data: RegisterBody) => {
    try {
      await registerUser(data)
      toast.success("Tạo tài khoản thành công!", {
        description:
          "Chào mừng bạn đến với NihoMemo. Hãy bắt đầu học ngay nhé!",
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      })
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      const errObj = err as { error?: string; message?: string } | undefined
      const errorMsg =
        errObj?.error ||
        errObj?.message ||
        "Đăng ký không thành công. Vui lòng thử lại."
      toast.error("Lỗi đăng ký", {
        description: errorMsg,
      })
    }
  }

  return (
    <AuthCardWrapper
      icon={<UserPlus className="size-6" />}
      title="Tạo tài khoản NihoMemo"
      description="Bắt đầu ghi nhớ tiếng Nhật hiệu quả với phương pháp Spaced Repetition"
      footerText="Đã có tài khoản?"
      footerLinkText="Đăng nhập ngay"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Họ và tên */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            Họ và tên
          </Label>
          <div className="relative">
            <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              className="pr-3 pl-9"
              disabled={isLoading}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-destructive text-xs font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

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
          <Label htmlFor="password" className="text-xs font-semibold">
            Mật khẩu (tối thiểu 6 ký tự)
          </Label>
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

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold">
            Xác nhận mật khẩu
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            disabled={isLoading}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-xs font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="shadow-primary/20 mt-2 w-full gap-2 shadow-md transition-all active:scale-[0.99]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <span>Hoàn tất đăng ký</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </AuthCardWrapper>
  )
}
