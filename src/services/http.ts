import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean
    _retry?: boolean
  }
}

const API_URL = String(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const API_VERSION: unknown = import.meta.env.API_VERSION
if (typeof API_VERSION !== 'string' || !API_VERSION) {
  throw new Error('API_VERSION belum diisi di file .env')
}

export const BACKEND_URL = API_URL.replace(/\/api$/, '')
export const API_BASE_URL = `${API_URL}/${API_VERSION}`

export const REFRESH_ENDPOINT = '/auth/refresh'

let onSessionExpired: () => void = () => {
  window.location.assign('/login?error=session')
}
export function setOnSessionExpired(handler: () => void) {
  onSessionExpired = handler
}

const baseConfig = {
  withCredentials: true,
  timeout: 30_000,
  headers: { Accept: 'application/json' },
}

export const api = axios.create({ ...baseConfig, baseURL: API_BASE_URL })

export const publicApi = axios.create({ ...baseConfig, baseURL: API_BASE_URL })

export const authClient = axios.create({ ...baseConfig, baseURL: BACKEND_URL })

export const isUnauthorized = (error: unknown) => isAxiosError(error) && error.response?.status === 401

let refreshPromise: Promise<void> | null = null

export function refreshSession(): Promise<void> {
  refreshPromise ??= authClient
    .post(REFRESH_ENDPOINT)
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined
    const bisaRefresh =
      error.response?.status === 401 && original && !original._retry && !original.skipAuthRefresh

    if (!bisaRefresh) throw error

    try {
      await refreshSession()
    } catch {
      onSessionExpired()
      throw error
    }

    original._retry = true
    return api(original)
  },
)

export function pesanError(error: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message
    if (typeof message === 'string' && message) return message
    if (!error.response) return 'Tidak dapat terhubung ke server.'
  }
  return fallback
}
