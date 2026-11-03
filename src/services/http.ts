// Axios instance untuk semua request ke backend.
//
// Skema auth (sesuaikan bila backend berbeda — semua titik penyesuaian ada di file ini):
// - Access token disimpan di MEMORI (bukan localStorage) dan dikirim sebagai `Authorization: Bearer`.
// - Refresh token disimpan backend sebagai cookie HttpOnly, sehingga request memakai `withCredentials`.
// - Jika response 401: minta access token baru ke REFRESH_ENDPOINT, lalu ulangi request semula.
//   Beberapa request yang gagal bersamaan hanya memicu SATU kali refresh.
// - Jika refresh gagal: token dihapus dan onSessionExpired dipanggil (default: ke halaman login).
//
// Setelah login Google, frontend belum memegang access token; request pertama akan 401 lalu
// otomatis refresh memakai cookie dari backend, jadi tidak perlu langkah khusus.

import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** true: jangan coba refresh token bila request ini 401 (mis. endpoint login/logout) */
    skipAuthRefresh?: boolean
    /** Internal: penanda request sudah diulang sekali setelah refresh */
    _retry?: boolean
  }
}

const API_URL: string = import.meta.env.VITE_API_URL ?? ''
export const REFRESH_ENDPOINT = '/auth/refresh'

// ---- Penyimpanan access token (memori) ----

let accessToken: string | null = null

export const getAccessToken = () => accessToken
export const setAccessToken = (token: string | null) => {
  accessToken = token
}

/** Dipanggil saat sesi tidak bisa diperpanjang. Bisa diganti, mis. dari router */
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

/** Instance terpisah TANPA interceptor, khusus refresh, agar 401 dari refresh tidak memicu refresh lagi */
const refreshClient = axios.create(baseConfig)

/** Ambil access token dari response refresh. Sesuaikan dengan bentuk response backend */
function ambilAccessToken(data: unknown): string {
  const token = (data as { accessToken?: unknown } | null)?.accessToken
  if (typeof token !== 'string' || !token) throw new Error('Response refresh tidak berisi accessToken')
  return token
}

// Satu promise refresh yang dipakai bersama oleh semua request yang 401 bersamaan
let refreshPromise: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  refreshPromise ??= refreshClient
    .post(REFRESH_ENDPOINT)
    .then((response) => {
      const token = ambilAccessToken(response.data)
      setAccessToken(token)
      return token
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// ---- Interceptor ----

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined
    const bisaRefresh =
      error.response?.status === 401 && original && !original._retry && !original.skipAuthRefresh

    if (!bisaRefresh) throw error

    let token: string
    try {
      token = await refreshAccessToken()
    } catch {
      setAccessToken(null)
      onSessionExpired()
      throw error
    }

    original._retry = true
    original.headers.set('Authorization', `Bearer ${token}`)
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
