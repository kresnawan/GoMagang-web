import { authClient, isUnauthorized, refreshSession, setOnSessionExpired } from './http'

// Alur login: tombol di frontend mengarah langsung ke halaman pilih akun Google.
// Google lalu mengembalikan `code` ke redirect URI di backend; backend yang menukar code,
// memvalidasi domain email, membuat sesi, lalu redirect balik ke frontend
// (atau ke /login?error=... jika gagal).

export const ALLOWED_EMAIL_DOMAIN = 'student.ub.ac.id'

const API_URL: string = import.meta.env.VITE_API_URL ?? ''

/** Endpoint backend yang memulai login Google (redirect ke halaman pilih akun) */
export const GOOGLE_LOGIN_URL = `${API_URL}/auth/google/login`

export const ME_ENDPOINT = '/auth/me'
export const LOGOUT_ENDPOINT = '/auth/logout'

// ---- Sesi & peran ----

export type Peran = 'mahasiswa' | 'tim_mb'

export type Sesi = {
  idPengguna: number
  email: string
  peran: Peran
}

/** Halaman awal tiap peran (tujuan redirect setelah login / saat salah akses) */
export const HOME_PATH: Record<Peran, string> = {
  mahasiswa: '/dasbor',
  tim_mb: '/tim-mb/pendaftar',
}

/**
 * Backend (/auth/me) belum mengirim peran, jadi peran diturunkan dari domain email:
 * akun @student.ub.ac.id = mahasiswa, selain itu = Tim MB (backend hanya memberi sesi ke akun
 * non-student yang terdaftar di tabel tim_mb). Jika backend nanti mengirim `peran`, itu yang dipakai.
 */
function toSesi(data: unknown): Sesi {
  const user = data as { id_pengguna: number; email: string; peran?: Peran }
  const peran =
    user.peran ?? (user.email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`) ? 'mahasiswa' : 'tim_mb')
  return { idPengguna: user.id_pengguna, email: user.email, peran }
}

async function fetchMe(): Promise<Sesi | null> {
  try {
    const { data } = await authClient.get(ME_ENDPOINT)
    return toSesi(data)
  } catch (error) {
    if (isUnauthorized(error)) return null
    throw error
  }
}

/** Ambil sesi aktif; jika access token kedaluwarsa, coba refresh sekali. null = belum login */
async function muatSesi(): Promise<Sesi | null> {
  const sesi = await fetchMe()
  if (sesi) return sesi

  try {
    await refreshSession()
  } catch (error) {
    if (isUnauthorized(error)) return null
    throw error
  }
  return fetchMe()
}

// Disimpan di memori agar guard tidak memanggil /auth/me di setiap navigasi
let sesiPromise: Promise<Sesi | null> | null = null

export function getSesi(): Promise<Sesi | null> {
  sesiPromise ??= muatSesi().catch((error: unknown) => {
    sesiPromise = null // error jaringan: jangan di-cache, coba lagi di navigasi berikutnya
    throw error
  })
  return sesiPromise
}

export function resetSesi() {
  sesiPromise = null
}

setOnSessionExpired(() => {
  resetSesi()
  window.location.assign('/login?error=session')
})

/**
 * Logout: POST ke backend dengan credentials, sehingga cookie access/refresh token ikut terkirim
 * dan backend bisa mencabut sesi serta menghapus cookie-nya.
 */
export async function logout() {
  await authClient.post(LOGOUT_ENDPOINT, null, { withCredentials: true })
  resetSesi()
}

/** Kode error dari backend pada /login?error=<kode>. Sesuaikan dengan backend nanti */
const LOGIN_ERROR_MESSAGE: Record<string, string> = {
  domain: `Gunakan akun @${ALLOWED_EMAIL_DOMAIN} untuk masuk.`,
  cancelled: 'Login dibatalkan.',
  session: 'Sesi kamu telah berakhir. Silakan login kembali.',
  not_registered: 'Akun ini belum terdaftar sebagai Tim Magang Berdampak.',
}

export function loginErrorMessage(code: string | null) {
  if (!code) return null
  return LOGIN_ERROR_MESSAGE[code] ?? 'Login gagal. Silakan coba lagi.'
}
