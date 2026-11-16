import { isAxiosError, type AxiosResponse } from 'axios'
import { api, publicApi } from './http'

export function simpanBlob(data: Blob, nama: string) {
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = nama
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function namaDariHeader(response: AxiosResponse): string | null {
  const header = String(response.headers['content-disposition'] ?? '')
  return /filename="([^"]+)"/.exec(header)?.[1] ?? null
}

async function teksBody(data: unknown): Promise<string | null> {
  if (data instanceof Blob) return data.text()
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data)
  if (typeof data === 'string') return data
  return null
}

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

export async function unduhBerkas(berkas: { id: number; nama: string }): Promise<void> {
  const { data } = await api.get<Blob>(`/berkas/${berkas.id}`, { responseType: 'blob' })
  simpanBlob(data, berkas.nama)
}

export type BerkasPublik = { isi: Blob; nama: string }

export function kedaluwarsaToken(token: string): Date | null {
  const bagian = token.split('.')
  if (bagian.length !== 3 || !/^[0-9]+$/.test(bagian[1])) return null
  return new Date(Number(bagian[1]) * 1000)
}

export async function getBerkasPublik(token: string, signal?: AbortSignal): Promise<BerkasPublik | null> {
  try {
    const response = await publicApi.get<Blob>(`/berkas/publik/${encodeURIComponent(token)}`, {
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
