// Axios instance untuk semua request ke backend.
//
// Skema auth (mengikuti backend):
// - Access token & refresh token disimpan backend sebagai cookie HttpOnly. Frontend tidak pernah
//   memegang token; cookie ikut terkirim otomatis karena `withCredentials: true`.
// - Jika response 401: panggil REFRESH_ENDPOINT (backend memasang cookie baru), lalu ulangi request.
//   Beberapa request yang gagal bersamaan hanya memicu SATU kali refresh.
// - Jika refresh gagal: onSessionExpired dipanggil (default: ke halaman login).

import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** true: jangan coba refresh token bila request ini 401 */
    skipAuthRefresh?: boolean
    /** Internal: penanda request sudah diulang sekali setelah refresh */
    _retry?: boolean
  }
}

const API_URL: string = import.meta.env.VITE_API_URL ?? ''
export const REFRESH_ENDPOINT = '/auth/refresh'

/** Dipanggil saat sesi tidak bisa diperpanjang. Bisa diganti lewat setOnSessionExpired */
let onSessionExpired: () => void = () => {
  window.location.assign('/login?error=session')
}
export function setOnSessionExpired(handler: () => void) {
  onSessionExpired = handler
}

// ---- Instance ----

const baseConfig = {
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30_000,
  headers: { Accept: 'application/json' },
}

export const api = axios.create(baseConfig)

/**
 * Instance TANPA interceptor untuk endpoint auth (me, refresh, logout):
 * 401 di sini tidak memicu refresh berulang maupun redirect otomatis
 */
export const authClient = axios.create(baseConfig)

export const isUnauthorized = (error: unknown) => isAxiosError(error) && error.response?.status === 401

// Satu promise refresh yang dipakai bersama oleh semua request yang 401 bersamaan
let refreshPromise: Promise<void> | null = null

/** Minta backend memperpanjang sesi (cookie baru dipasang lewat response) */
export function refreshSession(): Promise<void> {
  refreshPromise ??= authClient
    .post(REFRESH_ENDPOINT)
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// ---- Interceptor ----

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

// ---- Helper ----

/** Pesan error yang ramah untuk ditampilkan; pakai `message` dari body response bila ada */
export function pesanError(error: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message
    if (typeof message === 'string' && message) return message
    if (!error.response) return 'Tidak dapat terhubung ke server.'
  }
  return fallback
}
