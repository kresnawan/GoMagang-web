// Templat surat pernyataan DPA: GET & PUT /api/v1/templat-sp-dpa.
// Hanya ada satu templat yang berlaku (yang terakhir disimpan). PUT hanya untuk Panitia Magang; tautan lama tetap
// tersimpan di backend sebagai riwayat.

import { api } from './http'

export type TemplatSpDpa = {
  id: number
  tautan: string
  /** ISO 8601 waktu terakhir diubah */
  diubahPada: string
}

/** Batas panjang tautan (karakter), sama dengan backend */
export const TAUTAN_TEMPLAT_MAX = 255

type TemplatResponse = {
  id_templat: number
  tautan_templat: string
  updated_at: string
}

const ENDPOINT = '/api/v1/templat-sp-dpa'

const toTemplat = (res: TemplatResponse): TemplatSpDpa => ({
  id: res.id_templat,
  tautan: res.tautan_templat,
  diubahPada: res.updated_at,
})

/** URL lengkap http/https; dipakai untuk validasi form & sebelum tautan dirender sebagai link */
export function isTautanValid(tautan: string) {
  try {
    const url = new URL(tautan)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== '' && !/\s/.test(tautan)
  } catch {
    return false
  }
}

/** Templat yang berlaku; null bila Panitia Magang belum mengaturnya */
export async function getTemplatSpDpa(signal?: AbortSignal): Promise<TemplatSpDpa | null> {
  const { data } = await api.get<TemplatResponse | null>(ENDPOINT, { signal })
  return data ? toTemplat(data) : null
}

/** Hanya Panitia Magang. Error 422 membawa `message` (lihat pesanError) */
export async function simpanTemplatSpDpa(tautan: string, signal?: AbortSignal): Promise<TemplatSpDpa> {
  const { data } = await api.put<TemplatResponse>(ENDPOINT, { tautan_templat: tautan }, { signal })
  return toTemplat(data)
}
