"use client"

import * as React from "react"
import { UserPlus, Mail, User } from "lucide-react"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useRegisterForm } from "@/hooks/auth"
import { AuthCardWrapper } from "./auth-card-wrapper"
import { PasswordInput } from "./password-input"
import { AuthSubmitButton } from "./auth-submit-button"

export function RegisterForm() {
  const { register, errors, isLoading, handleSubmit } = useRegisterForm()

  return (
    <AuthCardWrapper
      icon={<UserPlus className="size-6" />}
      title="Tạo tài khoản NihoMemo"
      description="Bắt đầu ghi nhớ tiếng Nhật hiệu quả với phương pháp Spaced Repetition"
      footerText="Đã có tài khoản?"
      footerLinkText="Đăng nhập ngay"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Họ và tên */}
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Họ và tên</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <User />
              </InputGroupAddon>
              <InputGroupInput
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                disabled={isLoading}
                aria-invalid={!!errors.name}
                {...register("name")}
              />
            </InputGroup>
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          {/* Email */}
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Địa chỉ Email</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Mail />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={isLoading}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </InputGroup>
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          {/* Password */}
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">
              Mật khẩu (tối thiểu 6 ký tự)
            </FieldLabel>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              disabled={isLoading}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
          </Field>

          {/* Confirm Password */}
          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              disabled={isLoading}
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <FieldError>{errors.confirmPassword.message}</FieldError>
            )}
          </Field>

          {/* Submit Button */}
          <AuthSubmitButton
            isLoading={isLoading}
            loadingText="Đang tạo tài khoản..."
          >
            Hoàn tất đăng ký
          </AuthSubmitButton>
        </FieldGroup>
      </form>
    </AuthCardWrapper>
  )
}
