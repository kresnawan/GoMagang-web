import { api } from './http'

export type Posisi = {
  id: number
  posisi: string
  perusahaan: string
  idPerusahaan: number
  idPeriode: number
  deskripsiPersyaratan: string
  kuota: number
  gambar: string
  disembunyikanPada: string | null
}

export type PosisiFilter = {
  q?: string
  idPeriode?: number
  termasukDisembunyikan?: boolean
}

type PosisiResponse = {
  id_posisi: number
  posisi: string
  deskripsi_persyaratan: string
  kuota: number
  id_periode: number
  perusahaan: { id_perusahaan: number; nama_perusahaan: string }
  deleted_at: string | null
}

const WARNA_GAMBAR = ['#202F66', '#4E5E99', '#2B3B78', '#060F33', '#919ECC']
const BENTUK_USAHA = /^(pt|cv|ud|pd|tbk|persero)\.?$/i

function inisial(nama: string) {
  const kata = nama.split(/\s+/).filter((k) => k && !BENTUK_USAHA.test(k))
  return (kata.length ? kata : [nama]).slice(0, 2).map((k) => k[0]?.toUpperCase() ?? '').join('')
}

export function gambarInisial(namaPerusahaan: string, seed: number) {
  const warna = WARNA_GAMBAR[Math.abs(seed) % WARNA_GAMBAR.length]
  const teks = inisial(namaPerusahaan).replace(/[<>&'"]/g, '')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100'><rect width='300' height='100' fill='${warna}'/><text x='150' y='64' font-family='sans-serif' font-size='40' font-weight='700' fill='white' text-anchor='middle'>${teks}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function toPosisi(res: PosisiResponse): Posisi {
  return {
    id: res.id_posisi,
    posisi: res.posisi,
    perusahaan: res.perusahaan.nama_perusahaan,
    idPerusahaan: res.perusahaan.id_perusahaan,
    idPeriode: res.id_periode,
    deskripsiPersyaratan: res.deskripsi_persyaratan,
    kuota: res.kuota,
    gambar: gambarInisial(res.perusahaan.nama_perusahaan, res.perusahaan.id_perusahaan),
    disembunyikanPada: res.deleted_at,
  }
}

export async function getPosisiList(filter: PosisiFilter = {}, signal?: AbortSignal): Promise<Posisi[]> {
  const { data } = await api.get<PosisiResponse[]>('/posisi', {
    params: {
      s: filter.q || undefined,
      id_periode: filter.idPeriode,
      termasuk_dihapus: filter.termasukDisembunyikan || undefined,
    },
    signal,
  })
  return data.map(toPosisi)
}

export async function getPosisi(id: number, signal?: AbortSignal): Promise<Posisi | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null
  const daftar = await getPosisiList({}, signal)
  return daftar.find((item) => item.id === id) ?? null
}

export const NAMA_POSISI_MAX = 255

export type PosisiInput = {
  idPerusahaan: number
  idPeriode: number
  posisi: string
  deskripsiPersyaratan: string
  kuota: number
}

export async function tambahPosisi(input: PosisiInput, signal?: AbortSignal): Promise<Posisi> {
  const { data } = await api.post<PosisiResponse>(
    '/posisi',
    {
      id_perusahaan: input.idPerusahaan,
      id_periode: input.idPeriode,
      posisi: input.posisi,
      deskripsi_persyaratan: input.deskripsiPersyaratan,
      kuota: input.kuota,
    },
    { signal },
  )
  return toPosisi(data)
}

export type UbahPosisiInput = Pick<PosisiInput, 'posisi' | 'deskripsiPersyaratan' | 'kuota'>

export async function ubahPosisi(id: number, input: UbahPosisiInput, signal?: AbortSignal): Promise<Posisi> {
  const { data } = await api.patch<PosisiResponse>(
    `/posisi/${id}`,
    { posisi: input.posisi, deskripsi_persyaratan: input.deskripsiPersyaratan, kuota: input.kuota },
    { signal },
  )
  return toPosisi(data)
}

export async function sembunyikanPosisi(id: number, signal?: AbortSignal): Promise<Posisi> {
  const { data } = await api.delete<PosisiResponse>(`/posisi/${id}`, { signal })
  return toPosisi(data)
}

export const MAX_FILE_SIZE = 2 * 1024 * 1024
