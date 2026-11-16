import { redirect, type MiddlewareFunction } from 'react-router'
import { getSesi, HOME_PATH, type Peran } from './services/auth'

export function wajibPeran(peran: Peran): MiddlewareFunction {
  return async () => {
    const sesi = await getSesi()
    if (!sesi) throw redirect('/login')
    if (sesi.peran !== peran) throw redirect(HOME_PATH[sesi.peran])
  }
}

export const sesiLoader = () => getSesi()

export async function loginLoader() {
  const sesi = await getSesi().catch(() => null)
  if (sesi) throw redirect(HOME_PATH[sesi.peran])
  return null
}
