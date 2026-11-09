// Pendaftaran dari sisi mahasiswa: GET /api/v1/pendaftaran & /{id} (hanya miliknya), POST /api/v1/pendaftaran,
// PATCH /api/v1/pendaftaran/accept (konfirmasi penerimaan).
// Bentuk response sama dengan sisi Tim MB (services/pendaftar.ts), jadi tipe & pemetaannya dipakai bersama.
// Surat keterangan dibuat & diunduh lewat services/suratKeterangan.ts.

import { isAxiosError } from 'axios'
import { api } from './http'
import { gambarInisial } from './lowongan'

export const STATUS_PENDAFTARAN = [
  'Menunggu Verifikasi',
  'Lolos Seleksi Administrasi',
  'Diterima',
  'Aktif',
  'Selesai',
  'Tidak Lolos',
  'Batal/Mengundurkan Diri',
] as const
export type StatusPendaftaran = (typeof STATUS_PENDAFTARAN)[number]

/**
 * id_status di backend (dipakai filter `status` di GET /api/v1/pendaftaran). Backend belum punya endpoint daftar
 * status, jadi diturunkan dari urutan STATUS_PENDAFTARAN yang sama persis dengan urutan seed migration backend
 * (migrations/20261104000002_seed_status_pendaftaran.sql): Menunggu Verifikasi = 1 … Batal/Mengundurkan Diri = 7
 */
export const idStatus = (status: StatusPendaftaran) => STATUS_PENDAFTARAN.indexOf(status) + 1

/** Status akhir yang tidak dihitung dalam batas pendaftaran */
const STATUS_SELESAI: readonly StatusPendaftaran[] = ['Selesai', 'Tidak Lolos', 'Batal/Mengundurkan Diri']

/** Jumlah maksimal pendaftaran yang masih berjalan per mahasiswa */
export const MAX_PENDAFTARAN_BERJALAN = 2

export const isPendaftaranBerjalan = (pendaftaran: Pendaftaran) => !STATUS_SELESAI.includes(pendaftaran.status)

/** Pendaftaran mahasiswa yang masih berjalan, untuk menentukan posisi mana yang masih bisa didaftar */
export type PendaftaranBerjalan = {
  /** id posisi yang pendaftarannya belum berakhir. Setelah Selesai/Tidak Lolos/Batal, boleh didaftar lagi */
  posisi: Set<number>
  /** Sudah MAX_PENDAFTARAN_BERJALAN pendaftaran berjalan: tidak bisa mendaftar di posisi mana pun */
  batasTercapai: boolean
}

export async function getPendaftaranBerjalan(signal?: AbortSignal): Promise<PendaftaranBerjalan> {
  const berjalan = (await getPendaftaranList(signal)).filter(isPendaftaranBerjalan)
  return {
    posisi: new Set(berjalan.map((item) => item.idPosisi)),
    batasTercapai: berjalan.length >= MAX_PENDAFTARAN_BERJALAN,
  }
}

/** Alasan mahasiswa tidak bisa mendaftar di posisi ini (sama dengan aturan backend); null bila bisa */
export function alasanTidakBisaDaftar(berjalan: PendaftaranBerjalan, idPosisi: number): string | null {
  if (berjalan.batasTercapai) {
    return `Kamu sudah memiliki ${MAX_PENDAFTARAN_BERJALAN} pendaftaran yang sedang berjalan.`
  }
  if (berjalan.posisi.has(idPosisi)) return 'Kamu sudah mendaftar di posisi ini.'
  return null
}

/** Ringkasan pendaftaran (untuk Dasbor & Konversi MK) */
export type Pendaftaran = {
  /** id_pendaftaran sebagai string (dipakai di URL) */
  id: string
  idPosisi: number
  posisi: string
  perusahaan: string
  gambar: string
  status: StatusPendaftaran
  /** ISO 8601 */
  diajukanPada: string
  /** ISO 8601 */
  diubahPada: string
}

/** Tabel berkas_pendaftaran */
export type BerkasPendaftaran = {
  /** id_berkas, untuk unduh (services/berkas.ts) */
  id: number
  /** mis. "Surat Pernyataan DPA" atau "CV" */
  jenis: string
  nama: string
  /** byte */
  ukuran: number
}

/** Tabel log_status */
export type LogStatus = {
  id: string
  statusLama: StatusPendaftaran | null
  statusBaru: StatusPendaftaran
  /** ISO 8601 */
  dibuatPada: string
}

/** Tabel jadwal_seleksi_substansi */
export type JadwalSeleksiSubstansi = {
  /** YYYY-MM-DD */
  tanggal: string
  /** HH:mm */
  jam: string
  lokasi: string
}

/** Tabel surat_keterangan: ada setelah surat pertama kali diunduh (diterbitkan). Unduh lewat services/suratKeterangan.ts */
export type SuratKeterangan = {
  nama: string
  ukuran: number
  nomorSurat: string
}

/** Tabel plotting_dpm */
export type PlottingDpm = {
  nama: string
  kontak: string
}

export type PendaftaranDetail = Pendaftaran & {
  berkas: BerkasPendaftaran[]
  /** Urut dari yang paling lama */
  log: LogStatus[]
  jadwalSeleksi: JadwalSeleksiSubstansi | null
  suratKeterangan: SuratKeterangan | null
  plottingDpm: PlottingDpm | null
}

export type PendaftaranInput = {
  idPosisi: number
  suratDpa: File
  cv: File
  /** Portfolio & berkas tambahan (opsional, maks. MAX_BERKAS_TAMBAHAN) */
  berkasTambahan: File[]
}

/** Batas jumlah portfolio & berkas tambahan per pendaftaran, sama dengan backend */
export const MAX_BERKAS_TAMBAHAN = 5

// ---- Bentuk response backend (dipakai juga oleh services/pendaftar.ts) ----

export type PendaftaranResponse = {
  id_pendaftaran: number
  status: StatusPendaftaran
  created_at: string
  updated_at: string
  id_posisi: number
  posisi: string
  id_periode: number
  perusahaan: { id_perusahaan: number; nama_perusahaan: string }
  mahasiswa: { id_pengguna: number; nim: string | null; nama: string | null }
}

/** Satu baris di GET /api/v1/pendaftaran: ada penanda data tahap yang hanya ada di daftar */
export type PendaftaranListItemResponse = PendaftaranResponse & {
  ada_jadwal_seleksi: boolean
  ada_plotting_dpm: boolean
}

/** Bentuk response GET /api/v1/pendaftaran (dengan atau tanpa query p & r) */
export type HalamanPendaftaranResponse = {
  data: PendaftaranListItemResponse[]
  page: number
  rows: number
  total: number
  total_pages: number
}

export type PendaftaranDetailResponse = Omit<PendaftaranResponse, 'mahasiswa'> & {
  mahasiswa: PendaftaranResponse['mahasiswa'] & {
    email: string | null
    program_studi: string | null
    ipk: number | null
    no_hp: string | null
    jenis_kelamin: string | null
    semester: number | null
  }
  berkas: Array<{ id_berkas: number; jenis_berkas: string; nama_berkas: string; ukuran_berkas: number }>
  log: Array<{ id_log: number; status_lama: StatusPendaftaran | null; status_baru: StatusPendaftaran; created_at: string }>
  jadwal_seleksi: { tanggal: string; jam: string; lokasi: string } | null
  surat_keterangan: { nama_berkas: string; ukuran_berkas: number; nomor_surat: string } | null
  plotting_dpm: { nama_dpm: string; kontak_dpm: string } | null
}

/** Bagian detail yang sama untuk mahasiswa & Tim MB */
export function toTahapPendaftaran(res: PendaftaranDetailResponse) {
  return {
    berkas: res.berkas.map((b) => ({ id: b.id_berkas, jenis: b.jenis_berkas, nama: b.nama_berkas, ukuran: b.ukuran_berkas })),
    log: res.log.map((l) => ({ id: String(l.id_log), statusLama: l.status_lama, statusBaru: l.status_baru, dibuatPada: l.created_at })),
    jadwalSeleksi: res.jadwal_seleksi,
    suratKeterangan: res.surat_keterangan && {
      nama: res.surat_keterangan.nama_berkas,
      ukuran: res.surat_keterangan.ukuran_berkas,
      nomorSurat: res.surat_keterangan.nomor_surat,
    },
    plottingDpm: res.plotting_dpm && { nama: res.plotting_dpm.nama_dpm, kontak: res.plotting_dpm.kontak_dpm },
  } satisfies Pick<PendaftaranDetail, 'berkas' | 'log' | 'jadwalSeleksi' | 'suratKeterangan' | 'plottingDpm'>
}

const ENDPOINT = '/api/v1/pendaftaran'

const toPendaftaran = (res: PendaftaranResponse): Pendaftaran => ({
  id: String(res.id_pendaftaran),
  idPosisi: res.id_posisi,
  posisi: res.posisi,
  perusahaan: res.perusahaan.nama_perusahaan,
  // Seed id_perusahaan: warnanya sama dengan di daftar lowongan
  gambar: gambarInisial(res.perusahaan.nama_perusahaan, res.perusahaan.id_perusahaan),
  status: res.status,
  diajukanPada: res.created_at,
  diubahPada: res.updated_at,
})

// ---- API ----

/** Baris per permintaan pertama; pendaftaran per mahasiswa biasanya jauh lebih sedikit dari ini */
const ROWS_SEMUA = 100

/** Pendaftaran milik mahasiswa yang login, dari yang paling baru (semua status, semua halaman) */
export async function getPendaftaranList(signal?: AbortSignal): Promise<Pendaftaran[]> {
  // Tanpa r backend hanya mengirim 25 baris. Bila total melebihi ROWS_SEMUA, minta lagi dengan r = total
  const ambil = (r: number) => api.get<HalamanPendaftaranResponse>(ENDPOINT, { params: { r }, signal })
  let { data } = await ambil(ROWS_SEMUA)
  if (data.total > data.data.length) ({ data } = await ambil(data.total))
  return data.data.map(toPendaftaran)
}

/** null bila id tidak valid, tidak ditemukan (404), atau milik mahasiswa lain (403) */
export async function getPendaftaran(id: string, signal?: AbortSignal): Promise<PendaftaranDetail | null> {
  if (!/^[1-9][0-9]*$/.test(id)) return null
  try {
    const { data } = await api.get<PendaftaranDetailResponse>(`${ENDPOINT}/${id}`, { signal })
    return { ...toPendaftaran(data), ...toTahapPendaftaran(data) }
  } catch (err) {
    if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 403)) return null
    throw err
  }
}

/**
 * POST /api/v1/pendaftaran (multipart). Content-Type dibiarkan diisi otomatis agar boundary-nya benar.
 * Error 409 (periode tutup, sudah Aktif, sudah mendaftar, batas 2 pendaftaran) & 422 membawa `message`
 * yang bisa langsung ditampilkan (lihat pesanError)
 */
export async function kirimPendaftaran(input: PendaftaranInput, signal?: AbortSignal): Promise<{ id: number }> {
  const body = new FormData()
  body.set('id_posisi', String(input.idPosisi))
  body.set('surat_dpa', input.suratDpa)
  body.set('cv', input.cv)
  for (const file of input.berkasTambahan) body.append('berkas_tambahan', file)
  const { data } = await api.post<{ id_pendaftaran: number }>(ENDPOINT, body, { signal })
  return { id: data.id_pendaftaran }
}

/**
 * PATCH /api/v1/pendaftaran/accept?id={id}: Diterima → Aktif, dan pendaftaran lain yang masih berjalan
 * otomatis menjadi Batal/Mengundurkan Diri. Error 409 (status bukan Diterima, sudah punya pendaftaran Aktif)
 * membawa `message` yang bisa langsung ditampilkan (lihat pesanError)
 */
export async function konfirmasiPenerimaan(id: number, signal?: AbortSignal): Promise<PendaftaranDetail> {
  const { data } = await api.patch<PendaftaranDetailResponse>(`${ENDPOINT}/accept`, undefined, { params: { id }, signal })
  return { ...toPendaftaran(data), ...toTahapPendaftaran(data) }
}
