// MOCK: backend belum tersedia. Ganti isi fungsi-fungsi di bawah dengan fetch ke API
// asli; tipe & signature fungsi dibiarkan sama agar halaman tidak perlu diubah.
// Data pendaftaran dari sisi Tim MB (banyak mahasiswa), terpisah dari services/pendaftaran.ts (sisi mahasiswa).

import { JENIS_KELAMIN, PROGRAM_STUDI, type JenisKelamin, type ProgramStudi } from './dataDiri'
import type { BerkasPendaftaran, JadwalSeleksiSubstansi, LogStatus, PlottingDpm, StatusPendaftaran } from './pendaftaran'

export type Pendaftar = {
  id: string
  nim: string
  nama: string
  posisi: string
  perusahaan: string
  idPeriode: string
  status: StatusPendaftaran
  /** ISO 8601 */
  diajukanPada: string
  jadwalSeleksi: JadwalSeleksiSubstansi | null
  suratKeterangan: { nama: string; ukuran: number } | null
  plottingDpm: PlottingDpm | null
}

export const KOLOM_CARI = [
  { value: 'nama', label: 'Nama' },
  { value: 'nim', label: 'NIM' },
  { value: 'posisi', label: 'Posisi' },
  { value: 'perusahaan', label: 'Perusahaan' },
] as const
export type KolomCari = (typeof KOLOM_CARI)[number]['value']

export type PendaftarFilter = {
  q?: string
  cariBerdasarkan: KolomCari
  idPeriode?: string
  status?: StatusPendaftaran
}

export type PendaftarHalaman = {
  /** Baris pada halaman yang diminta */
  items: Pendaftar[]
  /** Jumlah semua data yang cocok dengan filter */
  total: number
  /** Ringkasan semua data yang cocok dengan filter (untuk "Pilih semua" lintas halaman) */
  semua: PendaftarRingkas[]
}

export type PendaftarRingkas = Pick<Pendaftar, 'id' | 'status' | 'nama' | 'nim'>

/** Detail lengkap satu pendaftar: data diri (isi formulir) + berkas + riwayat status */
export type PendaftarDetail = Pendaftar & {
  email: string
  jenisKelamin: JenisKelamin
  programStudi: ProgramStudi
  ipk: number
  semester: number
  nomorHp: string
  berkas: BerkasPendaftaran[]
  /** Urut dari yang paling lama */
  log: LogStatus[]
  /** ISO 8601 */
  diubahPada: string
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

export class PendaftarError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ---- Data contoh (deterministik) ----
const NAMA_DEPAN = ['Budi', 'Siti', 'Andi', 'Dewi', 'Rizky', 'Putri', 'Fajar', 'Nadia', 'Agus', 'Rina', 'Dimas', 'Ayu', 'Yoga', 'Sari']
const NAMA_BELAKANG = ['Santoso', 'Rahmawati', 'Pratama', 'Lestari', 'Hidayat', 'Wulandari', 'Saputra', 'Kusuma', 'Nugroho', 'Anggraini']
const POSISI: Array<[posisi: string, perusahaan: string, idPeriode: string]> = [
  ['Frontend Developer Intern', 'PT Nusantara Digital', 'pr-2'],
  ['Data Analyst Intern', 'PT Awan Biru Teknologi', 'pr-2'],
  ['UI/UX Designer Intern', 'CV Kreasi Rupa', 'pr-2'],
  ['Backend Developer Intern', 'PT Sinergi Sistem', 'pr-1'],
  ['Network Engineer Intern', 'PT Jaring Kencana', 'pr-1'],
]
const STATUS_CONTOH: StatusPendaftaran[] = [
  'Menunggu Verifikasi', 'Menunggu Verifikasi', 'Lolos Seleksi Administrasi', 'Lolos Seleksi Administrasi',
  'Diterima', 'Aktif', 'Aktif', 'Selesai', 'Tidak Lolos', 'Batal/Mengundurkan Diri',
]

/** Urutan status dari awal sampai status akhir contoh, untuk membangun riwayat log */
function jalurStatus(status: StatusPendaftaran, i: number): StatusPendaftaran[] {
  switch (status) {
    case 'Menunggu Verifikasi': return ['Menunggu Verifikasi']
    case 'Lolos Seleksi Administrasi': return ['Menunggu Verifikasi', 'Lolos Seleksi Administrasi']
    case 'Diterima': return ['Menunggu Verifikasi', 'Lolos Seleksi Administrasi', 'Diterima']
    case 'Aktif': return ['Menunggu Verifikasi', 'Lolos Seleksi Administrasi', 'Diterima', 'Aktif']
    case 'Selesai': return ['Menunggu Verifikasi', 'Lolos Seleksi Administrasi', 'Diterima', 'Aktif', 'Selesai']
    case 'Tidak Lolos': return i % 2 ? ['Menunggu Verifikasi', 'Tidak Lolos'] : ['Menunggu Verifikasi', 'Lolos Seleksi Administrasi', 'Tidak Lolos']
    case 'Batal/Mengundurkan Diri': return ['Menunggu Verifikasi', 'Lolos Seleksi Administrasi', 'Batal/Mengundurkan Diri']
  }
}

const HARI = 24 * 60 * 60 * 1000
let nextLogId = 1

const store: PendaftarDetail[] = Array.from({ length: 132 }, (_, i) => {
  const [posisi, perusahaan, idPeriode] = POSISI[(i * 7) % POSISI.length]
  const diajukan = Date.UTC(2026, 9, 1 + (i % 28), 2 + (i % 8), (i * 13) % 60)
  const namaDepan = NAMA_DEPAN[i % NAMA_DEPAN.length]
  const namaBelakang = NAMA_BELAKANG[(i * 3) % NAMA_BELAKANG.length]
  const status = STATUS_CONTOH[(i * 3) % STATUS_CONTOH.length]
  const log: LogStatus[] = jalurStatus(status, i).map((statusBaru, langkah, jalur) => ({
    id: `lgp-${nextLogId++}`,
    statusLama: langkah === 0 ? null : jalur[langkah - 1],
    statusBaru,
    dibuatPada: new Date(diajukan + langkah * 3 * HARI + langkah * 3_600_000).toISOString(),
  }))

  return {
    id: `pdr-${String(i + 1).padStart(3, '0')}`,
    nim: `2151502001${String(10000 + i * 37).slice(-5)}`,
    nama: `${namaDepan} ${namaBelakang}`,
    posisi,
    perusahaan,
    idPeriode,
    status,
    diajukanPada: log[0].dibuatPada,
    diubahPada: log[log.length - 1].dibuatPada,
    jadwalSeleksi: null,
    suratKeterangan: null,
    plottingDpm: null,
    email: `${namaDepan}.${namaBelakang}${i}@student.ub.ac.id`.toLowerCase(),
    jenisKelamin: JENIS_KELAMIN[i % 2],
    programStudi: PROGRAM_STUDI[i % PROGRAM_STUDI.length],
    ipk: Math.round((2.75 + ((i * 17) % 125) / 100) * 100) / 100,
    semester: 5 + (i % 4),
    nomorHp: `08${String(1_200_000_000 + i * 7_919_311).slice(0, 10)}`,
    berkas: [
      { jenis: 'Surat Pernyataan DPA', nama: `Surat_DPA_${namaDepan}_${namaBelakang}.pdf`, ukuran: 150_000 + i * 811 },
      { jenis: 'CV', nama: `CV_${namaDepan}_${namaBelakang}.pdf`, ukuran: 280_000 + i * 1_337 },
    ],
    log,
  }
})

/** Bentuk ringkas untuk daftar (tanpa data diri, berkas, & log) */
function toPendaftar({ id, nim, nama, posisi, perusahaan, idPeriode, status, diajukanPada, jadwalSeleksi, suratKeterangan, plottingDpm }: PendaftarDetail): Pendaftar {
  return structuredClone({ id, nim, nama, posisi, perusahaan, idPeriode, status, diajukanPada, jadwalSeleksi, suratKeterangan, plottingDpm })
}

function cocok(item: Pendaftar, filter: PendaftarFilter) {
  const q = filter.q?.toLowerCase()
  return (
    (!q || item[filter.cariBerdasarkan].toLowerCase().includes(q)) &&
    (!filter.idPeriode || item.idPeriode === filter.idPeriode) &&
    (!filter.status || item.status === filter.status)
  )
}

export async function getPendaftarList(filter: PendaftarFilter, halaman: number, rows: number): Promise<PendaftarHalaman> {
  await delay(400)
  const hasil = store
    .filter((item) => cocok(item, filter))
    .sort((a, b) => Date.parse(b.diajukanPada) - Date.parse(a.diajukanPada))
  const awal = (halaman - 1) * rows
  return {
    items: hasil.slice(awal, awal + rows).map(toPendaftar),
    total: hasil.length,
    semua: hasil.map(({ id, status, nama, nim }) => ({ id, status, nama, nim })),
  }
}

/** Ambil data asli dari store & pastikan statusnya sesuai syarat aksi */
function ambilDenganStatus(ids: string[], status: StatusPendaftaran) {
  if (ids.length === 0) throw new PendaftarError('Tidak ada pendaftar yang dipilih.')
  return ids.map((id) => {
    const item = store.find((pendaftar) => pendaftar.id === id)
    if (!item) throw new PendaftarError('Sebagian pendaftar tidak ditemukan.')
    if (item.status !== status) throw new PendaftarError(`${item.nama} tidak berstatus ${status}.`)
    return item
  })
}

/** Jadwal seleksi substansi yang sama untuk semua pendaftar terpilih (menimpa jadwal lama) */
export async function simpanJadwalSeleksi(ids: string[], jadwal: JadwalSeleksiSubstansi): Promise<void> {
  await delay(600)
  for (const item of ambilDenganStatus(ids, 'Lolos Seleksi Administrasi')) item.jadwalSeleksi = { ...jadwal }
}

/** Dosen pembimbing yang sama untuk semua pendaftar terpilih (menimpa plotting lama) */
export async function simpanPlottingDpm(ids: string[], plotting: PlottingDpm): Promise<void> {
  await delay(600)
  for (const item of ambilDenganStatus(ids, 'Aktif')) item.plottingDpm = { ...plotting }
}

/** Satu file surat keterangan per pendaftar */
export async function simpanSuratKeterangan(berkas: Array<{ id: string; file: File }>): Promise<void> {
  await delay(800)
  const items = ambilDenganStatus(berkas.map((item) => item.id), 'Aktif')
  items.forEach((item, index) => {
    const { file } = berkas[index]
    item.suratKeterangan = { nama: file.name, ukuran: file.size }
  })
}

export async function getPendaftarDetail(id: string): Promise<PendaftarDetail | null> {
  await delay(400)
  const item = store.find((pendaftar) => pendaftar.id === id)
  return item ? structuredClone(item) : null
}

/** Ubah status oleh Tim MB; hanya transisi di TRANSISI_TIM_MB yang diizinkan, dan tercatat di log */
export async function ubahStatusPendaftar(id: string, statusBaru: StatusPendaftaran): Promise<void> {
  await delay(600)
  const item = store.find((pendaftar) => pendaftar.id === id)
  if (!item) throw new PendaftarError('Pendaftar tidak ditemukan.')
  if (!TRANSISI_TIM_MB[item.status].includes(statusBaru)) {
    throw new PendaftarError(`Status ${item.status} tidak dapat diubah menjadi ${statusBaru}.`)
  }

  const sekarang = new Date().toISOString()
  item.log.push({ id: `lgp-${nextLogId++}`, statusLama: item.status, statusBaru, dibuatPada: sekarang })
  item.status = statusBaru
  item.diubahPada = sekarang
}
