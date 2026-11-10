// Perusahaan mitra: GET & POST /api/v1/perusahaan, PATCH & DELETE /api/v1/perusahaan/{id}.
// DELETE adalah soft delete: perusahaan disembunyikan, barisnya tetap ada (deleted_at terisi).

import { api } from './http'

export type Perusahaan = {
  id: number
  nama: string
  /** ISO 8601 waktu disembunyikan; null bila masih aktif */
  disembunyikanPada: string | null
}

/** Batas panjang nama (karakter), sama dengan backend */
export const NAMA_PERUSAHAAN_MAX = 255

/** Bentuk satu item response GET/POST/PATCH/DELETE /api/v1/perusahaan */
type PerusahaanResponse = {
  id_perusahaan: number
  nama_perusahaan: string
  deleted_at: string | null
}

const ENDPOINT = '/api/v1/perusahaan'

const toPerusahaan = (res: PerusahaanResponse): Perusahaan => ({
  id: res.id_perusahaan,
  nama: res.nama_perusahaan,
  disembunyikanPada: res.deleted_at,
})

/**
 * Perusahaan mitra yang aktif, urut nama. Dengan `termasukDisembunyikan` (hanya Tim MB) yang
 * disembunyikan ikut dikirim, di bawah yang aktif
 */
export async function getPerusahaan(signal?: AbortSignal, termasukDisembunyikan = false): Promise<Perusahaan[]> {
  const params = termasukDisembunyikan ? { termasuk_dihapus: true } : undefined
  const { data } = await api.get<PerusahaanResponse[]>(ENDPOINT, { params, signal })
  return data.map(toPerusahaan)
}

/** Error 409 (nama sudah ada) & 422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError) */
export async function tambahPerusahaan(nama: string, signal?: AbortSignal): Promise<Perusahaan> {
  const { data } = await api.post<PerusahaanResponse>(ENDPOINT, { nama_perusahaan: nama }, { signal })
  return toPerusahaan(data)
}

/** Error 404 (tidak ada / sudah disembunyikan), 409 (nama sudah ada) & 422; 409 & 422 membawa `message` */
export async function ubahNamaPerusahaan(id: number, nama: string, signal?: AbortSignal): Promise<Perusahaan> {
  const { data } = await api.patch<PerusahaanResponse>(`${ENDPOINT}/${id}`, { nama_perusahaan: nama }, { signal })
  return toPerusahaan(data)
}

/**
 * Soft delete: perusahaan hilang dari daftar & tidak bisa dipilih untuk posisi baru, posisinya hilang dari
 * katalog dan tidak bisa didaftar lagi. Pendaftaran yang sudah ada tetap. Error 404 bila sudah disembunyikan
 */
export async function sembunyikanPerusahaan(id: number, signal?: AbortSignal): Promise<Perusahaan> {
  const { data } = await api.delete<PerusahaanResponse>(`${ENDPOINT}/${id}`, { signal })
  return toPerusahaan(data)
}
