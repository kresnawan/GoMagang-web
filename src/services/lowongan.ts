// Daftar posisi magang: API asli (GET/POST /api/v1/posisi), dipakai halaman Pendaftaran & Katalog Tim MB.
// Detail satu lowongan (halaman form pendaftaran) masih MOCK karena backend belum punya
// endpoint detail; lihat bagian MOCK di bawah.

import { api } from './http'

// ---- Daftar posisi (API) ----

/** Posisi magang untuk daftar lowongan mahasiswa */
export type Posisi = {
  id: number
  posisi: string
  perusahaan: string
  deskripsiPersyaratan: string
  kuotaTotal: number
  sisaKuota: number
  /** Placeholder inisial perusahaan (backend belum menyimpan gambar) */
  gambar: string
}

export type PosisiFilter = {
  /** Cari di nama posisi */
  q?: string
  /** Kosong = periode default dari backend (yang sedang berjalan) */
  idPeriode?: number
}

/** Bentuk response GET /api/v1/posisi */
type PosisiResponse = {
  id_posisi: number
  posisi: string
  deskripsi_persyaratan: string
  kuota_total: number
  sisa_kuota: number
  id_periode: number
  perusahaan: { id_perusahaan: number; nama_perusahaan: string }
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
    deskripsiPersyaratan: res.deskripsi_persyaratan,
    kuotaTotal: res.kuota_total,
    sisaKuota: res.sisa_kuota,
    gambar: gambarInisial(res.perusahaan.nama_perusahaan, res.perusahaan.id_perusahaan),
  }
}

/**
 * GET /api/v1/posisi. Tanpa idPeriode: mahasiswa mendapat periode berjalan ([] jika belum ada yang dibuka),
 * Tim MB mendapat periode berjalan atau yang mulai paling akhir
 */
export async function getPosisiList(filter: PosisiFilter = {}, signal?: AbortSignal): Promise<Posisi[]> {
  const { data } = await api.get<PosisiResponse[]>('/api/v1/posisi', {
    params: { s: filter.q || undefined, id_periode: filter.idPeriode },
    signal,
  })
  return data.map(toPosisi)
}

/** Batas panjang nama posisi (karakter), sama dengan backend */
export const NAMA_POSISI_MAX = 255

/** Body POST /api/v1/posisi; sisa kuota otomatis = kuota total */
export type PosisiInput = {
  idPerusahaan: number
  idPeriode: number
  posisi: string
  deskripsiPersyaratan: string
  kuotaTotal: number
}

/** POST /api/v1/posisi (Tim MB). Error 422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError) */
export async function tambahPosisi(input: PosisiInput, signal?: AbortSignal): Promise<Posisi & { idPeriode: number }> {
  const { data } = await api.post<PosisiResponse>(
    '/api/v1/posisi',
    {
      id_perusahaan: input.idPerusahaan,
      id_periode: input.idPeriode,
      posisi: input.posisi,
      deskripsi_persyaratan: input.deskripsiPersyaratan,
      kuota_total: input.kuotaTotal,
    },
    { signal },
  )
  return { ...toPosisi(data), idPeriode: data.id_periode }
}

export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

// ---- MOCK: detail lowongan untuk form pendaftaran. Hapus saat endpoint detail tersedia ----

export type Lowongan = {
  id: string
  posisi: string
  perusahaan: string
  gambar: string
  kuota: number
  terisi: number
}

const store: Lowongan[] = (
  [
    { id: 'lw-001', posisi: 'Frontend Developer Intern', perusahaan: 'PT Nusantara Digital', kuota: 5, terisi: 2 },
    { id: 'lw-002', posisi: 'Data Analyst Intern', perusahaan: 'PT Awan Biru Teknologi', kuota: 3, terisi: 1 },
    { id: 'lw-003', posisi: 'UI/UX Designer Intern', perusahaan: 'CV Kreasi Rupa', kuota: 2, terisi: 2 },
    { id: 'lw-004', posisi: 'Backend Developer Intern', perusahaan: 'PT Sinergi Sistem', kuota: 4, terisi: 0 },
    { id: 'lw-005', posisi: 'Network Engineer Intern', perusahaan: 'PT Jaring Kencana', kuota: 3, terisi: 1 },
    { id: 'lw-006', posisi: 'Machine Learning Intern', perusahaan: 'PT Awan Biru Teknologi', kuota: 2, terisi: 0 },
  ] satisfies Omit<Lowongan, 'gambar'>[]
).map((item, i) => ({ ...item, gambar: gambarInisial(item.perusahaan, i) }))

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const sisaKuota = (lowongan: Lowongan) => lowongan.kuota - lowongan.terisi

export async function getLowongan(id: string): Promise<Lowongan | null> {
  await delay(400)
  const item = store.find((lowongan) => lowongan.id === id)
  return item ? { ...item } : null
}

/** MOCK helper: akses langsung ke data lowongan untuk service mock lain. Hapus saat backend siap */
export function mockFindLowongan(id: string) {
  return store.find((item) => item.id === id)
}
