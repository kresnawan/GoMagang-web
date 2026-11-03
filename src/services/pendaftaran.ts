// MOCK: backend belum tersedia. Ganti isi fungsi-fungsi di bawah dengan fetch ke API
// asli; tipe & signature fungsi dibiarkan sama agar halaman tidak perlu diubah.

import { mockFindLowongan, sisaKuota } from './lowongan'

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

/** Status akhir yang tidak dihitung dalam batas pendaftaran */
const STATUS_SELESAI: readonly StatusPendaftaran[] = ['Selesai', 'Tidak Lolos', 'Batal/Mengundurkan Diri']

/** Jumlah maksimal pendaftaran yang masih berjalan per mahasiswa */
export const MAX_PENDAFTARAN_BERJALAN = 2

export const isPendaftaranBerjalan = (pendaftaran: Pendaftaran) => !STATUS_SELESAI.includes(pendaftaran.status)

/** Ringkasan pendaftaran (untuk Dasbor) */
export type Pendaftaran = {
  id: string
  lowonganId: string
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
  jenis: 'Surat Pernyataan DPA' | 'CV'
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

/** Tabel surat_keterangan */
export type SuratKeterangan = {
  nama: string
  ukuran: number
  url: string
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
  lowonganId: string
  suratDpa: File
  cv: File
}

export class PendaftaranError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let nextId = 1
let nextLogId = 1

/** Catat perubahan status; status & diubahPada pendaftaran ikut diperbarui */
function tambahLog(pendaftaran: PendaftaranDetail, statusBaru: StatusPendaftaran, dibuatPada = new Date().toISOString()) {
  pendaftaran.log.push({
    id: `log-${nextLogId++}`,
    statusLama: pendaftaran.log.at(-1)?.statusBaru ?? null,
    statusBaru,
    dibuatPada,
  })
  pendaftaran.status = statusBaru
  pendaftaran.diubahPada = dibuatPada
}

function buatPendaftaran(
  lowonganId: string,
  berkas: BerkasPendaftaran[],
  riwayat: Array<[StatusPendaftaran, string]>,
  jadwalSeleksi: JadwalSeleksiSubstansi | null = null,
): PendaftaranDetail {
  const lowongan = mockFindLowongan(lowonganId)
  if (!lowongan) throw new PendaftaranError('Lowongan tidak ditemukan.')

  const pendaftaran: PendaftaranDetail = {
    id: `pd-${String(nextId++).padStart(3, '0')}`,
    lowonganId,
    posisi: lowongan.posisi,
    perusahaan: lowongan.perusahaan,
    gambar: lowongan.gambar,
    status: riwayat[0][0],
    diajukanPada: riwayat[0][1],
    diubahPada: riwayat[0][1],
    berkas,
    log: [],
    jadwalSeleksi,
    suratKeterangan: null,
    plottingDpm: null,
  }
  for (const [status, waktu] of riwayat) tambahLog(pendaftaran, status, waktu)
  return pendaftaran
}

/** PDF satu halaman sebagai pengganti file surat dari backend */
function mockSuratPdf(judul: string) {
  const isi = `BT /F1 16 Tf 72 760 Td (${judul}) Tj ET`
  const pdf = [
    '%PDF-1.4',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj',
    `4 0 obj<</Length ${isi.length}>>stream\n${isi}\nendstream endobj`,
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
    'trailer<</Root 1 0 R>>',
    '%%EOF',
  ].join('\n')
  const blob = new Blob([pdf], { type: 'application/pdf' })
  return { ukuran: blob.size, url: URL.createObjectURL(blob) }
}

const berkasContoh: BerkasPendaftaran[] = [
  { jenis: 'Surat Pernyataan DPA', nama: 'Surat_Pernyataan_DPA_Budi.pdf', ukuran: 182_340 },
  { jenis: 'CV', nama: 'CV_Budi_Santoso.pdf', ukuran: 356_912 },
]

const store: PendaftaranDetail[] = [
  buatPendaftaran(
    'lw-001',
    berkasContoh,
    [
      ['Menunggu Verifikasi', '2026-10-20T14:02:00+07:00'],
      ['Lolos Seleksi Administrasi', '2026-10-25T10:30:00+07:00'],
      ['Diterima', '2026-11-01T15:00:00+07:00'],
    ],
    { tanggal: '2026-10-29', jam: '09:00', lokasi: 'Kantor PT Nusantara Digital, Jakarta' },
  ),
  buatPendaftaran(
    'lw-005',
    berkasContoh,
    [
      ['Menunggu Verifikasi', '2026-10-12T08:45:00+07:00'],
      ['Lolos Seleksi Administrasi', '2026-10-19T16:10:00+07:00'],
    ],
    { tanggal: '2026-11-05', jam: '13:00', lokasi: 'Daring (Zoom)' },
  ),
]

function toRingkasan({ id, lowonganId, posisi, perusahaan, gambar, status, diajukanPada, diubahPada }: PendaftaranDetail): Pendaftaran {
  return { id, lowonganId, posisi, perusahaan, gambar, status, diajukanPada, diubahPada }
}

export async function getPendaftaranList(): Promise<Pendaftaran[]> {
  await delay(400)
  return store.map(toRingkasan).sort((a, b) => b.diajukanPada.localeCompare(a.diajukanPada))
}

export async function getPendaftaran(id: string): Promise<PendaftaranDetail | null> {
  await delay(400)
  const item = store.find((pendaftaran) => pendaftaran.id === id)
  return item ? structuredClone(item) : null
}

export async function submitPendaftaran(input: PendaftaranInput): Promise<Pendaftaran> {
  await delay(800)
  const lowongan = mockFindLowongan(input.lowonganId)
  if (!lowongan) throw new PendaftaranError('Lowongan tidak ditemukan.')
  if (sisaKuota(lowongan) <= 0) throw new PendaftaranError('Kuota lowongan ini sudah penuh.')
  if (store.filter(isPendaftaranBerjalan).length >= MAX_PENDAFTARAN_BERJALAN) {
    throw new PendaftaranError(`Kamu sudah memiliki ${MAX_PENDAFTARAN_BERJALAN} pendaftaran yang sedang berjalan.`)
  }

  lowongan.terisi += 1
  const pendaftaran = buatPendaftaran(
    input.lowonganId,
    [
      { jenis: 'Surat Pernyataan DPA', nama: input.suratDpa.name, ukuran: input.suratDpa.size },
      { jenis: 'CV', nama: input.cv.name, ukuran: input.cv.size },
    ],
    [['Menunggu Verifikasi', new Date().toISOString()]],
  )
  store.push(pendaftaran)
  return toRingkasan(pendaftaran)
}

/**
 * Mahasiswa menerima tawaran magang: status menjadi Aktif,
 * pendaftaran lain yang masih berjalan otomatis menjadi Batal/Mengundurkan Diri.
 */
export async function konfirmasiPenerimaan(id: string): Promise<void> {
  await delay(800)
  const pendaftaran = store.find((item) => item.id === id)
  if (!pendaftaran) throw new PendaftaranError('Pendaftaran tidak ditemukan.')
  if (pendaftaran.status !== 'Diterima') {
    throw new PendaftaranError('Hanya pendaftaran berstatus Diterima yang bisa dikonfirmasi.')
  }

  tambahLog(pendaftaran, 'Aktif')
  for (const lainnya of store) {
    if (lainnya !== pendaftaran && isPendaftaranBerjalan(lainnya)) tambahLog(lainnya, 'Batal/Mengundurkan Diri')
  }

  // MOCK: di backend asli surat & plotting DPM diisi Tim MB belakangan, bukan saat konfirmasi
  pendaftaran.suratKeterangan = {
    nama: `Surat_Keterangan_Magang_${pendaftaran.id}.pdf`,
    ...mockSuratPdf('Surat Keterangan Kepesertaan Magang'),
  }
  pendaftaran.plottingDpm = { nama: 'Dr. Rina Kusuma, S.Kom., M.T.', kontak: 'rina.kusuma@univ.ac.id' }
}
