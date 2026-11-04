// Perusahaan mitra: GET & POST /api/v1/perusahaan.

import { api } from './http'

export type Perusahaan = {
  id: number
  nama: string
}

/** Batas panjang nama (karakter), sama dengan backend */
export const NAMA_PERUSAHAAN_MAX = 255

/** Bentuk satu item response GET/POST /api/v1/perusahaan */
type PerusahaanResponse = {
  id_perusahaan: number
  nama_perusahaan: string
}

const ENDPOINT = '/api/v1/perusahaan'

const toPerusahaan = (res: PerusahaanResponse): Perusahaan => ({
  id: res.id_perusahaan,
  nama: res.nama_perusahaan,
})

/** Semua perusahaan mitra, urut nama */
export async function getPerusahaan(signal?: AbortSignal): Promise<Perusahaan[]> {
  const { data } = await api.get<PerusahaanResponse[]>(ENDPOINT, { signal })
  return data.map(toPerusahaan)
}

/** Error 409 (nama sudah ada) & 422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError) */
export async function tambahPerusahaan(nama: string, signal?: AbortSignal): Promise<Perusahaan> {
  const { data } = await api.post<PerusahaanResponse>(ENDPOINT, { nama_perusahaan: nama }, { signal })
  return toPerusahaan(data)
}
