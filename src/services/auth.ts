import { authClient, BACKEND_URL, isUnauthorized, refreshSession, setOnSessionExpired } from './http'

export const ALLOWED_EMAIL_DOMAIN = 'student.ub.ac.id'

export const GOOGLE_LOGIN_URL = `${BACKEND_URL}/auth/google/login`

export const ME_ENDPOINT = '/auth/me'
export const LOGOUT_ENDPOINT = '/auth/logout'

export type Peran = 'mahasiswa' | 'panitia_magang'

export type Sesi = {
  idPengguna: number
  email: string
  peran: Peran
}

export const HOME_PATH: Record<Peran, string> = {
  mahasiswa: '/dasbor',
  panitia_magang: '/panitia-magang/pendaftar',
}

function toSesi(data: unknown): Sesi {
  const user = data as { id_pengguna: number; email: string; peran?: Peran }
  const peran =
    user.peran ?? (user.email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`) ? 'mahasiswa' : 'panitia_magang')
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

let sesiPromise: Promise<Sesi | null> | null = null

export function getSesi(): Promise<Sesi | null> {
  sesiPromise ??= muatSesi().catch((error: unknown) => {
    sesiPromise = null
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

export async function logout() {
  await authClient.post(LOGOUT_ENDPOINT, null, { withCredentials: true })
  resetSesi()
}

const LOGIN_ERROR_MESSAGE: Record<string, string> = {
  domain: `Gunakan akun @${ALLOWED_EMAIL_DOMAIN} untuk masuk.`,
  cancelled: 'Login dibatalkan.',
  session: 'Sesi kamu telah berakhir. Silakan login kembali.',
  not_registered: 'Akun ini belum terdaftar sebagai Panitia Magang.',
}

export function loginErrorMessage(code: string | null) {
  if (!code) return null
  return LOGIN_ERROR_MESSAGE[code] ?? 'Login gagal. Silakan coba lagi.'
}
