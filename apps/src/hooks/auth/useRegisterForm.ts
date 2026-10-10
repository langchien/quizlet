import { RegisterBodySchema, type RegisterBody } from "@/schemas/auth"
import { useAuthStore } from "@/stores/useAuthStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function useRegisterForm() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()

  const form = useForm<RegisterBody>({
    resolver: zodResolver(RegisterBodySchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  // Đăng ký
  const onSubmit = async (data: RegisterBody) => {
    try {
      await registerUser(data)
      toast.success("Tạo tài khoản thành công!", {
        description:
          "Chào mừng bạn đến với NihoMemo. Hãy bắt đầu học ngay nhé!",
        icon: React.createElement(CheckCircle2, {
          className: "size-4 text-emerald-500",
        }),
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

  return {
    form,
    register,
    errors,
    isLoading,
    handleSubmit: handleSubmit(onSubmit),
  }
}
