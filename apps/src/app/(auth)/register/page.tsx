"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  UserPlus,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
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
import { RegisterBodySchema, type RegisterBody } from "@/schemas/auth"
import { useAuthStore } from "@/stores/useAuthStore"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
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
    <Card className="border-border/70 bg-card/85 hover:shadow-primary/5 shadow-2xl backdrop-blur-xl transition-all">
      <CardHeader className="space-y-2 pb-6 text-center">
        <div className="bg-primary/10 text-primary ring-primary/25 mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl ring-1">
          <UserPlus className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Tạo tài khoản NihoMemo
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Bắt đầu ghi nhớ tiếng Nhật hiệu quả với phương pháp Spaced Repetition
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Họ và tên */}
          <div className="space-y-1.5">
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
            <Label htmlFor="password" className="text-xs font-semibold">
              Mật khẩu (tối thiểu 6 ký tự)
            </Label>
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-9 pl-9"
                disabled={isLoading}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs font-medium">
                {errors.confirmPassword.message}
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
                <span>Đang khởi tạo tài khoản...</span>
              </>
            ) : (
              <>
                <span>Đăng ký tài khoản</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <Separator className="bg-border/60" />

      <CardFooter className="text-muted-foreground flex items-center justify-center p-6 text-center text-xs">
        <span>Đã có tài khoản?</span>
        <Link
          href="/login"
          className="text-primary ml-1.5 font-semibold hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </CardFooter>
    </Card>
  )
}
