import { redirect, type MiddlewareFunction } from 'react-router'
import { getSesi, HOME_PATH, type Peran } from './services/auth'

/**
 * Middleware route: hanya peran tertentu yang boleh masuk.
 * - Belum login → /login
 * - Login dengan peran lain → halaman awal perannya
 *
 * Catatan: ini hanya untuk UX. Pembatasan akses data yang sebenarnya tetap wajib di backend.
 */
export function wajibPeran(peran: Peran): MiddlewareFunction {
  return async () => {
    const sesi = await getSesi()
    if (!sesi) throw redirect('/login')
    if (sesi.peran !== peran) throw redirect(HOME_PATH[sesi.peran])
  }
}

/**
 * Loader layout: menyediakan data sesi untuk layout.
 * Middleware client hanya berjalan bila ada loader di route yang cocok, jadi loader ini juga
 * memastikan guard selalu dijalankan (termasuk di halaman tanpa loader).
 */
export const sesiLoader = () => getSesi()

/** Loader /login: yang sudah login langsung diarahkan ke halaman awal perannya */
export async function loginLoader() {
  // Backend tidak bisa dihubungi: tetap tampilkan halaman login
  const sesi = await getSesi().catch(() => null)
  if (sesi) throw redirect(HOME_PATH[sesi.peran])
  return null
}
