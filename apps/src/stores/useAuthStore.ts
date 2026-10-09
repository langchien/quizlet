import { create } from "zustand"
import { api } from "@/lib/api"
import type { LoginBody, RegisterBody, UserBaseDTO } from "@/schemas"

export interface AuthUser extends UserBaseDTO {
  goal?: Record<string, unknown> | null
  settings?: Record<string, unknown> | null
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean

  // Actions
  login: (credentials: LoginBody) => Promise<void>
  register: (credentials: RegisterBody) => Promise<void>
  logout: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isInitialized: true,
    })
  },

  login: async (credentials: LoginBody) => {
    set({ isLoading: true })
    try {
      const response = await api.post("/api/auth/login", credentials)
      const data = response.data
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (credentials: RegisterBody) => {
    set({ isLoading: true })
    try {
      const response = await api.post("/api/auth/register", credentials)
      const data = response.data
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await api.post("/api/auth/logout")
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get("/api/auth/me")
      const data = response.data
      set({
        user: data.user,
        isAuthenticated: !!data.user,
        isLoading: false,
        isInitialized: true,
      })
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      })
    }
  },
}))
