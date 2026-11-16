import { api } from './http'

export type Perusahaan = {
  id: number
  nama: string
  disembunyikanPada: string | null
}

export const NAMA_PERUSAHAAN_MAX = 255

type PerusahaanResponse = {
  id_perusahaan: number
  nama_perusahaan: string
  deleted_at: string | null
}

const ENDPOINT = '/perusahaan'

const toPerusahaan = (res: PerusahaanResponse): Perusahaan => ({
  id: res.id_perusahaan,
  nama: res.nama_perusahaan,
  disembunyikanPada: res.deleted_at,
})

export async function getPerusahaan(signal?: AbortSignal, termasukDisembunyikan = false): Promise<Perusahaan[]> {
  const params = termasukDisembunyikan ? { termasuk_dihapus: true } : undefined
  const { data } = await api.get<PerusahaanResponse[]>(ENDPOINT, { params, signal })
  return data.map(toPerusahaan)
}

export async function tambahPerusahaan(nama: string, signal?: AbortSignal): Promise<Perusahaan> {
  const { data } = await api.post<PerusahaanResponse>(ENDPOINT, { nama_perusahaan: nama }, { signal })
  return toPerusahaan(data)
}

export async function ubahNamaPerusahaan(id: number, nama: string, signal?: AbortSignal): Promise<Perusahaan> {
  const { data } = await api.patch<PerusahaanResponse>(`${ENDPOINT}/${id}`, { nama_perusahaan: nama }, { signal })
  return toPerusahaan(data)
}

export async function sembunyikanPerusahaan(id: number, signal?: AbortSignal): Promise<Perusahaan> {
  const { data } = await api.delete<PerusahaanResponse>(`${ENDPOINT}/${id}`, { signal })
  return toPerusahaan(data)
}
