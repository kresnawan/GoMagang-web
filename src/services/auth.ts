// Alur login: tombol di frontend mengarah langsung ke halaman pilih akun Google.
// Google lalu mengembalikan `code` ke redirect URI di backend; backend yang menukar code,
// memvalidasi domain email, membuat sesi, lalu redirect balik ke frontend
// (atau ke /login?error=... jika gagal).

export const ALLOWED_EMAIL_DOMAIN = 'student.ub.ac.id'

const API_URL: string = import.meta.env.VITE_API_URL ?? ''

/** URL halaman pilih akun Google; null jika VITE_GOOGLE_CLIENT_ID belum diisi */
export const GOOGLE_LOGIN_URL = `${API_URL}/auth/google/login`


/** Kode error dari backend pada /login?error=<kode>. Sesuaikan dengan backend nanti */
const LOGIN_ERROR_MESSAGE: Record<string, string> = {
  domain: `Gunakan akun @${ALLOWED_EMAIL_DOMAIN} untuk masuk.`,
  cancelled: 'Login dibatalkan.',
}

export function loginErrorMessage(code: string | null) {
  if (!code) return null
  return LOGIN_ERROR_MESSAGE[code] ?? 'Login gagal. Silakan coba lagi.'
}
