"use client"

import { useLandingHealth } from "./use-landing-health"
import { useLandingAuth } from "./use-landing-auth"
import { useLandingJlpt } from "./use-landing-jlpt"

/**
 * Hook tổng hợp toàn bộ state và nghiệp vụ cho Landing Page
 */
export function useLanding() {
  const health = useLandingHealth()
  const auth = useLandingAuth()
  const jlpt = useLandingJlpt()

  return {
    health,
    auth,
    jlpt,
  }
}
