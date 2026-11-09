// Pendaftaran dari sisi Tim MB (semua mahasiswa): GET /api/v1/pendaftaran & /{id}, PATCH /api/v1/pendaftaran?id= (ubah status),
// PUT /api/v1/pendaftaran/jadwal-seleksi-substansi & /plot-dpm (satu atau banyak pendaftar).
// POST /api/v1/pendaftaran/ekspor (berkas Excel dari pendaftaran terpilih, dibuat backend).
// Unduh berkas: services/berkas.ts. Tipe response & pemetaan tahap dipakai bersama dengan services/pendaftaran.ts.
// Pagination, pencarian nama, dan filter periode/status/perusahaan dikerjakan backend (getHalamanPendaftar).

import { JENIS_KELAMIN_DARI_KODE } from './dataDiri'
import { isAxiosError } from 'axios'
import { bacaErrorBlob, namaDariHeader, simpanBlob } from './berkas'
import { api } from './http'
import {
  toTahapPendaftaran,
  type BerkasPendaftaran,
  type JadwalSeleksiSubstansi,
  type LogStatus,
  type HalamanPendaftaranResponse,
  type PendaftaranDetailResponse,
  type PendaftaranListItemResponse,
  type PendaftaranResponse,
  type PlottingDpm,
  type StatusPendaftaran,
  type SuratKeterangan,
} from './pendaftaran'

export type Pendaftar = {
  id: number
  nim: string
  nama: string
  posisi: string
  perusahaan: string
  /** id_periode backend */
  idPeriode: number
  status: StatusPendaftaran
  /** ISO 8601 */
  diajukanPada: string
  /** ISO 8601 */
  diubahPada: string
  /** Jadwal seleksi substansi sudah diisi (hanya dari daftar; detail punya isinya di jadwalSeleksi) */
  adaJadwalSeleksi: boolean
  /** Plotting DPM sudah diisi (hanya dari daftar; detail punya isinya di plottingDpm) */
  adaPlottingDpm: boolean
}

/**
 * Query GET /api/v1/pendaftaran, dengan nama yang sama persis seperti di backend (dan di URL halaman Pendaftar).
 * Yang undefined tidak dikirim, sehingga backend memakai bawaannya
 */
export type PendaftarQuery = {
  /** Halaman, mulai dari 1 (bawaan backend 1) */
  p: number
  /** Baris per halaman (bawaan backend 25) */
  r: number
  /** Bagian dari nama mahasiswa */
  s?: string
  /** id_periode */
  periode?: number
  /** id_status, lihat idStatus */
  status?: number
  /** id_perusahaan */
  perusahaan?: number
  /** id_posisi */
  posisi?: number
}

export type PendaftarHalaman = {
  /** Baris pada halaman yang diminta */
  items: Pendaftar[]
  /** Jumlah semua data (yang cocok dengan filter) dari semua halaman */
  total: number
}

/** Data pendaftar terpilih yang dibutuhkan aksi massal */
export type PendaftarRingkas = Pick<Pendaftar, 'id' | 'status' | 'nama' | 'nim' | 'adaJadwalSeleksi' | 'adaPlottingDpm'>

export type BerkasPendaftar = BerkasPendaftaran

/** Detail lengkap satu pendaftar: data diri + berkas + riwayat status + data tahap */
export type PendaftarDetail = Omit<Pendaftar, 'adaJadwalSeleksi' | 'adaPlottingDpm'> & {
  email: string | null
  jenisKelamin: string | null
  programStudi: string | null
  ipk: number | null
  semester: number | null
  nomorHp: string | null
  berkas: BerkasPendaftar[]
  /** Urut dari yang paling lama */
  log: LogStatus[]
  jadwalSeleksi: JadwalSeleksiSubstansi | null
  suratKeterangan: SuratKeterangan | null
  plottingDpm: PlottingDpm | null
}

/**
 * Perubahan status yang boleh dilakukan Tim MB dari tiap status.
 * Diterima → Aktif dilakukan mahasiswa (konfirmasi penerimaan). Selesai/Tidak Lolos/Batal adalah status akhir.
 */
export const TRANSISI_TIM_MB: Record<StatusPendaftaran, StatusPendaftaran[]> = {
  'Menunggu Verifikasi': ['Lolos Seleksi Administrasi', 'Tidak Lolos'],
  'Lolos Seleksi Administrasi': ['Diterima', 'Tidak Lolos'],
  Diterima: [],
  Aktif: ['Selesai'],
  Selesai: [],
  'Tidak Lolos': [],
  'Batal/Mengundurkan Diri': [],
}

const ENDPOINT = '/api/v1/pendaftaran'

/** Bagian yang sama untuk baris daftar & detail */
function toPendaftarDasar(res: PendaftaranResponse): Omit<Pendaftar, 'adaJadwalSeleksi' | 'adaPlottingDpm'> {
  return {
    id: res.id_pendaftaran,
    // Data diri wajib lengkap saat mendaftar, tapi tetap dijaga agar pencarian tidak error
    nim: res.mahasiswa.nim ?? '',
    nama: res.mahasiswa.nama ?? '',
    posisi: res.posisi,
    perusahaan: res.perusahaan.nama_perusahaan,
    idPeriode: res.id_periode,
    status: res.status,
    diajukanPada: res.created_at,
    diubahPada: res.updated_at,
  }
}

const toPendaftar = (res: PendaftaranListItemResponse): Pendaftar => ({
  ...toPendaftarDasar(res),
  adaJadwalSeleksi: res.ada_jadwal_seleksi,
  adaPlottingDpm: res.ada_plotting_dpm,
})

function toPendaftarDetail(res: PendaftaranDetailResponse): PendaftarDetail {
  const { mahasiswa: m } = res
  return {
    ...toPendaftarDasar(res),
    email: m.email,
    jenisKelamin: (m.jenis_kelamin && JENIS_KELAMIN_DARI_KODE[m.jenis_kelamin]) || m.jenis_kelamin,
    programStudi: m.program_studi,
    ipk: m.ipk,
    semester: m.semester,
    nomorHp: m.no_hp,
    ...toTahapPendaftaran(res),
  }
}

// ---- API ----

/**
 * Satu halaman pendaftaran (Tim MB) yang cocok dengan pencarian & filter, dari yang paling baru.
 * Pencarian, filter, dan pagination semuanya dikerjakan backend
 */
export async function getHalamanPendaftar(query: PendaftarQuery, signal?: AbortSignal): Promise<PendaftarHalaman> {
  const { data } = await api.get<HalamanPendaftaranResponse>(ENDPOINT, { params: query, signal })
  return { items: data.data.map(toPendaftar), total: data.total }
}

/**
 * Semua pendaftaran (dari semua halaman) yang cocok dengan pencarian & filter, untuk "Pilih semua".
 * Diminta dalam satu halaman dengan r = perkiraan total; bila ternyata bertambah, diminta lagi dengan total terbaru
 */
export async function getSemuaPendaftar(
  filter: Omit<PendaftarQuery, 'p' | 'r'>,
  perkiraanTotal: number,
  signal?: AbortSignal,
): Promise<Pendaftar[]> {
  const ambil = (r: number) =>
    api.get<HalamanPendaftaranResponse>(ENDPOINT, { params: { ...filter, p: 1, r: Math.max(r, 1) }, signal })
  let { data } = await ambil(perkiraanTotal)
  if (data.total > data.data.length) ({ data } = await ambil(data.total))
  return data.data.map(toPendaftar)
}

/** Format berkas ekspor yang didukung backend, beserta labelnya */
export const FORMAT_EKSPOR = [{ format: 'xlsx', label: 'Excel (.xlsx)' }] as const

export type FormatEkspor = (typeof FORMAT_EKSPOR)[number]['format']

/** Batas jumlah pendaftaran dalam satu ekspor, sama dengan backend */
export const MAX_EKSPOR = 10_000

/**
 * POST /api/v1/pendaftaran/ekspor: berkas dibuat backend dari pendaftaran terpilih, lalu diunduh.
 * Error 404 (ada yang tidak ditemukan) tanpa body; 422 membawa `message` (lihat pesanError)
 */
export async function eksporPendaftar(idPendaftar: number[], format: FormatEkspor): Promise<void> {
  try {
    const response = await api.post<Blob>(
      `${ENDPOINT}/ekspor`,
      { format, id_pendaftaran: idPendaftar },
      { responseType: 'blob' },
    )
    simpanBlob(response.data, namaDariHeader(response) ?? `pendaftar.${format}`)
  } catch (err) {
    await bacaErrorBlob(err)
    throw err
  }
}

/** null bila tidak ditemukan (404) atau id tidak valid */
export async function getPendaftarDetail(id: number, signal?: AbortSignal): Promise<PendaftarDetail | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null
  try {
    const { data } = await api.get<PendaftaranDetailResponse>(`${ENDPOINT}/${id}`, { signal })
    return toPendaftarDetail(data)
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null
    throw err
  }
}

/**
 * PATCH /api/v1/pendaftaran?id={id}. Mengembalikan detail terbaru. Error 409 (perubahan tidak diizinkan)
 * & 422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError)
 */
export async function ubahStatusPendaftar(id: number, status: StatusPendaftaran, signal?: AbortSignal): Promise<PendaftarDetail> {
  const { data } = await api.patch<PendaftaranDetailResponse>(ENDPOINT, { status }, { params: { id }, signal })
  return toPendaftarDetail(data)
}

/** Batas panjang lokasi jadwal seleksi (karakter), sama dengan backend */
export const LOKASI_JADWAL_MAX = 255

export type JadwalSeleksiInput = {
  idPendaftar: number[]
  /** YYYY-MM-DD, tidak boleh sebelum hari ini (WIB) */
  tanggal: string
  /** HH:MM, 24 jam */
  jam: string
  lokasi: string
}

/** Tanggal hari ini menurut WIB (YYYY-MM-DD), patokan backend untuk "tanggal sudah lewat" */
export const hariIniWib = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())

/**
 * Cek input jadwal sebelum dikirim, dengan aturan yang sama seperti backend. Pesannya juga disamakan
 * dengan pesan 422 backend. null bila valid
 */
export function validasiJadwalSeleksi(input: JadwalSeleksiInput): string | null {
  if (input.idPendaftar.length === 0) return 'Pilih minimal satu pendaftaran.'
  const [tahun, bulan, hari] = input.tanggal.split('-').map(Number)
  const tanggal = new Date(Date.UTC(tahun, bulan - 1, hari))
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.tanggal) ||
    tanggal.getUTCFullYear() !== tahun ||
    tanggal.getUTCMonth() !== bulan - 1 ||
    tanggal.getUTCDate() !== hari
  ) {
    return 'Tanggal harus berformat YYYY-MM-DD.'
  }
  if (input.tanggal < hariIniWib()) return 'Tanggal tidak boleh sudah lewat.'
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.jam)) return 'Jam harus berformat HH:MM.'
  const lokasi = input.lokasi.trim()
  if (lokasi.length < 1 || lokasi.length > LOKASI_JADWAL_MAX) return `Lokasi harus berisi 1-${LOKASI_JADWAL_MAX} karakter.`
  return null
}

/**
 * PUT /api/v1/pendaftaran/jadwal-seleksi-substansi: satu jadwal untuk semua id (jadwal lama diganti).
 * Ditolak seluruhnya bila ada satu saja yang tidak ditemukan (404) atau tidak berstatus Lolos Seleksi
 * Administrasi (409). Error 409 & 422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError)
 */
export async function simpanJadwalSeleksi(input: JadwalSeleksiInput, signal?: AbortSignal): Promise<void> {
  await api.put(
    `${ENDPOINT}/jadwal-seleksi-substansi`,
    { id_pendaftaran: input.idPendaftar, tanggal: input.tanggal, jam: input.jam, lokasi: input.lokasi.trim() },
    { signal },
  )
}

/** Batas panjang nama & kontak DPM (karakter), sama dengan backend */
export const DPM_TEKS_MAX = 255

export type PlottingDpmInput = {
  idPendaftar: number[]
  namaDpm: string
  /** Bebas, mis. email atau nomor HP */
  kontakDpm: string
}

/** Cek input plotting sebelum dikirim, dengan aturan & pesan yang sama seperti 422 backend. null bila valid */
export function validasiPlottingDpm(input: PlottingDpmInput): string | null {
  if (input.idPendaftar.length === 0) return 'Pilih minimal satu pendaftaran.'
  const panjangValid = (teks: string) => teks.trim().length >= 1 && teks.trim().length <= DPM_TEKS_MAX
  if (!panjangValid(input.namaDpm)) return `Nama DPM harus berisi 1-${DPM_TEKS_MAX} karakter.`
  if (!panjangValid(input.kontakDpm)) return `Kontak DPM harus berisi 1-${DPM_TEKS_MAX} karakter.`
  return null
}

/**
 * PUT /api/v1/pendaftaran/plot-dpm: satu DPM untuk semua id (plotting lama diganti).
 * Ditolak seluruhnya bila ada satu saja yang tidak ditemukan (404) atau tidak berstatus Aktif (409).
 * Error 409 & 422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError)
 */
export async function simpanPlottingDpm(input: PlottingDpmInput, signal?: AbortSignal): Promise<void> {
  await api.put(
    `${ENDPOINT}/plot-dpm`,
    { id_pendaftaran: input.idPendaftar, nama_dpm: input.namaDpm.trim(), kontak_dpm: input.kontakDpm.trim() },
    { signal },
  )
}
