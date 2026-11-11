// Unduh berkas pendaftaran: GET /api/v1/berkas/{id_berkas} (pemilik berkas & Panitia Magang), dan
// GET /api/v1/berkas/publik/{token} (siapa pun yang memegang link dari file ekspor, tanpa login).

import { isAxiosError, type AxiosResponse } from 'axios'
import { api, authClient } from './http'

/** Simpan Blob sebagai file lewat link sementara */
export function simpanBlob(data: Blob, nama: string) {
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = nama
  link.click()
  // Beri waktu browser memulai unduhan sebelum URL dilepas
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Nama file dari header Content-Disposition (perlu di-expose lewat CORS); null bila tidak ada */
export function namaDariHeader(response: AxiosResponse): string | null {
  const header = String(response.headers['content-disposition'] ?? '')
  return /filename="([^"]+)"/.exec(header)?.[1] ?? null
}

/** Teks body error mentah: Blob di browser (adapter XHR), string/ArrayBuffer di adapter lain */
async function teksBody(data: unknown): Promise<string | null> {
  if (data instanceof Blob) return data.text()
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data)
  if (typeof data === 'string') return data
  return null
}

/**
 * Dengan responseType 'blob', body error (mis. 409 `{ message }`) tidak berupa objek JSON, sehingga
 * pesanError tidak bisa membacanya. Ubah kembali ke JSON di tempat
 */
export async function bacaErrorBlob(err: unknown): Promise<void> {
  if (!isAxiosError(err) || !err.response) return
  const teks = await teksBody(err.response.data)
  if (teks === null) return
  try {
    err.response.data = JSON.parse(teks)
  } catch {
    err.response.data = undefined
  }
}

/**
 * Unduh lewat axios (bukan link biasa), supaya access token yang kedaluwarsa
 * diperpanjang otomatis oleh interceptor sebelum file diambil
 */
export async function unduhBerkas(berkas: { id: number; nama: string }): Promise<void> {
  const { data } = await api.get<Blob>(`/api/v1/berkas/${berkas.id}`, { responseType: 'blob' })
  simpanBlob(data, berkas.nama)
}

/** Berkas yang dibuka lewat link publik */
export type BerkasPublik = { isi: Blob; nama: string }

/**
 * Waktu kedaluwarsa link publik, dibaca dari tokennya (`{id_berkas}.{kedaluwarsa}.{tag}`, kedaluwarsa dalam
 * detik Unix). null bila bentuk tokennya salah. Hanya untuk pesan; keabsahannya tetap diperiksa backend
 */
export function kedaluwarsaToken(token: string): Date | null {
  const bagian = token.split('.')
  if (bagian.length !== 3 || !/^[0-9]+$/.test(bagian[1])) return null
  return new Date(Number(bagian[1]) * 1000)
}

/**
 * Berkas dari link publik. Memakai authClient (tanpa interceptor login): pengunjungnya orang luar yang
 * tidak login. null bila link tidak valid, sudah kedaluwarsa, atau berkasnya sudah dihapus (404)
 */
export async function getBerkasPublik(token: string, signal?: AbortSignal): Promise<BerkasPublik | null> {
  try {
    const response = await authClient.get<Blob>(`/api/v1/berkas/publik/${encodeURIComponent(token)}`, {
      responseType: 'blob',
      signal,
    })
    return { isi: response.data, nama: namaDariHeader(response) ?? 'berkas.pdf' }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null
    await bacaErrorBlob(err)
    throw err
  }
}
