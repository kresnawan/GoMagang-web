// Posisi magang: GET/POST /api/v1/posisi dan PATCH/DELETE /api/v1/posisi/{id}, dipakai halaman Pendaftaran
// (daftar & form) dan Katalog Tim MB. DELETE adalah soft delete: posisi disembunyikan, barisnya tetap ada.

import { api } from './http'

// ---- Daftar posisi (API) ----

/** Posisi magang untuk daftar lowongan mahasiswa */
export type Posisi = {
  id: number
  posisi: string
  perusahaan: string
  /** id_perusahaan backend */
  idPerusahaan: number
  /** id_periode backend */
  idPeriode: number
  deskripsiPersyaratan: string
  /** Kuota penerimaan; hanya informasi, tidak membatasi jumlah pendaftar */
  kuota: number
  /** Placeholder inisial perusahaan (backend belum menyimpan gambar) */
  gambar: string
  /** ISO 8601 waktu disembunyikan; null bila masih aktif */
  disembunyikanPada: string | null
}

export type PosisiFilter = {
  /** Cari di nama posisi */
  q?: string
  /** Kosong = periode default dari backend (yang sedang berjalan) */
  idPeriode?: number
  /** Ikut ambil posisi yang disembunyikan, di bawah yang aktif. Hanya untuk Tim MB */
  termasukDisembunyikan?: boolean
}

/** Bentuk response GET /api/v1/posisi */
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

/** Inisial perusahaan tanpa bentuk usaha, mis. "PT Nusantara Digital" → "ND" */
function inisial(nama: string) {
  const kata = nama.split(/\s+/).filter((k) => k && !BENTUK_USAHA.test(k))
  return (kata.length ? kata : [nama]).slice(0, 2).map((k) => k[0]?.toUpperCase() ?? '').join('')
}

/** Gambar placeholder berisi inisial perusahaan; warnanya tetap untuk perusahaan yang sama */
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

/**
 * GET /api/v1/posisi. Tanpa idPeriode: mahasiswa mendapat periode berjalan ([] jika belum ada yang dibuka),
 * Tim MB mendapat periode berjalan atau yang mulai paling akhir
 */
export async function getPosisiList(filter: PosisiFilter = {}, signal?: AbortSignal): Promise<Posisi[]> {
  const { data } = await api.get<PosisiResponse[]>('/api/v1/posisi', {
    params: {
      s: filter.q || undefined,
      id_periode: filter.idPeriode,
      termasuk_dihapus: filter.termasukDisembunyikan || undefined,
    },
    signal,
  })
  return data.map(toPosisi)
}

/**
 * Satu posisi untuk form pendaftaran. Backend belum punya endpoint detail, jadi diambil dari daftar
 * periode berjalan (satu-satunya periode yang bisa didaftar mahasiswa). null bila tidak ada di sana
 */
export async function getPosisi(id: number, signal?: AbortSignal): Promise<Posisi | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null
  const daftar = await getPosisiList({}, signal)
  return daftar.find((item) => item.id === id) ?? null
}

/** Batas panjang nama posisi (karakter), sama dengan backend */
export const NAMA_POSISI_MAX = 255

/** Body POST /api/v1/posisi */
export type PosisiInput = {
  idPerusahaan: number
  idPeriode: number
  posisi: string
  deskripsiPersyaratan: string
  /** Kuota penerimaan, minimal 1 */
  kuota: number
}

/** POST /api/v1/posisi (Tim MB). Error 422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError) */
export async function tambahPosisi(input: PosisiInput, signal?: AbortSignal): Promise<Posisi> {
  const { data } = await api.post<PosisiResponse>(
    '/api/v1/posisi',
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

/** Body PATCH /api/v1/posisi/{id}. Perusahaan & periode tidak bisa diubah */
export type UbahPosisiInput = Pick<PosisiInput, 'posisi' | 'deskripsiPersyaratan' | 'kuota'>

/**
 * PATCH /api/v1/posisi/{id} (Tim MB). Error 404 bila posisi atau perusahaannya sudah disembunyikan;
 * 422 membawa `message` (lihat pesanError)
 */
export async function ubahPosisi(id: number, input: UbahPosisiInput, signal?: AbortSignal): Promise<Posisi> {
  const { data } = await api.patch<PosisiResponse>(
    `/api/v1/posisi/${id}`,
    { posisi: input.posisi, deskripsi_persyaratan: input.deskripsiPersyaratan, kuota: input.kuota },
    { signal },
  )
  return toPosisi(data)
}

/**
 * DELETE /api/v1/posisi/{id} (Tim MB), soft delete: posisi hilang dari daftar lowongan mahasiswa dan tidak
 * bisa didaftar lagi. Pendaftaran yang sudah ada tetap. Error 404 bila sudah disembunyikan
 */
export async function sembunyikanPosisi(id: number, signal?: AbortSignal): Promise<Posisi> {
  const { data } = await api.delete<PosisiResponse>(`/api/v1/posisi/${id}`, { signal })
  return toPosisi(data)
}

export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
