import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"

/**
 * Axios instance cấu hình sẵn cho toàn bộ ứng dụng NihoMemo
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Hỗ trợ gửi HttpOnly Cookies
  timeout: 15000,
})

// Request interceptor: Gắn logging hoặc xử lý header nếu cần
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Xử lý dữ liệu và bắt lỗi tập trung
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    const errorData = error.response?.data
    return Promise.reject(errorData || error)
  }
)

/**
 * Helper types và functions tiện ích
 */
export const apiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then((res) => res.data),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => api.post<T>(url, data, config).then((res) => res.data),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => api.put<T>(url, data, config).then((res) => res.data),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => api.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config).then((res) => res.data),
}

export default api
