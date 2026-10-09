"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  LogIn,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoginBodySchema, type LoginBody } from "@/schemas/auth"
import { useAuthStore } from "@/stores/useAuthStore"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [showPassword, setShowPassword] = React.useState(false)
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
    <Card className="border-border/70 bg-card/85 hover:shadow-primary/5 shadow-2xl backdrop-blur-xl transition-all">
      <CardHeader className="space-y-2 pb-6 text-center">
        <div className="bg-primary/10 text-primary ring-primary/25 mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl ring-1">
          <LogIn className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Đăng nhập NihoMemo
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tiếp tục lộ trình học từ vựng, Kanji và ngữ pháp tiếng Nhật
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">
                Mật khẩu
              </Label>
            </div>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-9 pl-9"
                disabled={isLoading}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
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
      </CardContent>

      <Separator className="bg-border/60" />

      <CardFooter className="text-muted-foreground flex items-center justify-center p-6 text-center text-xs">
        <span>Chưa có tài khoản?</span>
        <Link
          href="/register"
          className="text-primary ml-1.5 font-semibold hover:underline"
        >
          Tạo tài khoản mới
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="border-border/70 bg-card/85 p-8 text-center backdrop-blur-xl">
          <Loader2 className="text-primary mx-auto size-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">
            Đang tải trang đăng nhập...
          </p>
        </Card>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
