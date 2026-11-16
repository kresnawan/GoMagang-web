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

export const idStatus = (status: StatusPendaftaran) => STATUS_PENDAFTARAN.indexOf(status) + 1

const STATUS_SELESAI: readonly StatusPendaftaran[] = ['Selesai', 'Tidak Lolos', 'Batal/Mengundurkan Diri']

export const MAX_PENDAFTARAN_PER_PERIODE = 2

export const isPendaftaranBerjalan = (pendaftaran: Pendaftaran) => !STATUS_SELESAI.includes(pendaftaran.status)

export type RiwayatPendaftaran = {
  posisiBerjalan: Set<number>
  jumlahPerPeriode: Map<number, number>
}

export function ringkasRiwayat(pendaftaran: Pendaftaran[]): RiwayatPendaftaran {
  const jumlahPerPeriode = new Map<number, number>()
  for (const item of pendaftaran) jumlahPerPeriode.set(item.idPeriode, (jumlahPerPeriode.get(item.idPeriode) ?? 0) + 1)
  return {
    posisiBerjalan: new Set(pendaftaran.filter(isPendaftaranBerjalan).map((item) => item.idPosisi)),
    jumlahPerPeriode,
  }
}

export async function getRiwayatPendaftaran(signal?: AbortSignal): Promise<RiwayatPendaftaran> {
  return ringkasRiwayat(await getPendaftaranList(signal))
}

export const jumlahDiPeriode = (riwayat: RiwayatPendaftaran, idPeriode: number) =>
  riwayat.jumlahPerPeriode.get(idPeriode) ?? 0

export const batasPeriodeTercapai = (riwayat: RiwayatPendaftaran, idPeriode: number) =>
  jumlahDiPeriode(riwayat, idPeriode) >= MAX_PENDAFTARAN_PER_PERIODE

export function alasanTidakBisaDaftar(
  riwayat: RiwayatPendaftaran,
  posisi: { id: number; idPeriode: number },
): string | null {
  if (batasPeriodeTercapai(riwayat, posisi.idPeriode)) {
    return `Kamu sudah mendaftar ${MAX_PENDAFTARAN_PER_PERIODE} kali di periode ini.`
  }
  if (riwayat.posisiBerjalan.has(posisi.id)) return 'Kamu sudah mendaftar di posisi ini.'
  return null
}

export type Pendaftaran = {
  id: string
  idPosisi: number
  idPeriode: number
  posisi: string
  perusahaan: string
  gambar: string
  status: StatusPendaftaran
  diajukanPada: string
  diubahPada: string
}

export type BerkasPendaftaran = {
  id: number
  jenis: string
  nama: string
  ukuran: number
}

export type LogStatus = {
  id: string
  statusLama: StatusPendaftaran | null
  statusBaru: StatusPendaftaran
  dibuatPada: string
}

export type JadwalSeleksiSubstansi = {
  tanggal: string
  jam: string
  lokasi: string
}

export type SuratKeterangan = {
  nama: string
  ukuran: number
  nomorSurat: string
}

export type PlottingDpm = {
  nama: string
  kontak: string
}

export type PendaftaranDetail = Pendaftaran & {
  berkas: BerkasPendaftaran[]
  log: LogStatus[]
  jadwalSeleksi: JadwalSeleksiSubstansi | null
  suratKeterangan: SuratKeterangan | null
  plottingDpm: PlottingDpm | null
}

export type PendaftaranInput = {
  idPosisi: number
  suratDpa: File
  cv: File
  berkasTambahan: File[]
}

export const MAX_BERKAS_TAMBAHAN = 5

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

export type PendaftaranListItemResponse = PendaftaranResponse & {
  ada_jadwal_seleksi: boolean
  ada_plotting_dpm: boolean
}

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

const ENDPOINT = '/pendaftaran'

const toPendaftaran = (res: PendaftaranResponse): Pendaftaran => ({
  id: String(res.id_pendaftaran),
  idPosisi: res.id_posisi,
  idPeriode: res.id_periode,
  posisi: res.posisi,
  perusahaan: res.perusahaan.nama_perusahaan,
  gambar: gambarInisial(res.perusahaan.nama_perusahaan, res.perusahaan.id_perusahaan),
  status: res.status,
  diajukanPada: res.created_at,
  diubahPada: res.updated_at,
})

const ROWS_SEMUA = 100

export async function getPendaftaranList(signal?: AbortSignal): Promise<Pendaftaran[]> {
  const ambil = (r: number) => api.get<HalamanPendaftaranResponse>(ENDPOINT, { params: { r }, signal })
  let { data } = await ambil(ROWS_SEMUA)
  if (data.total > data.data.length) ({ data } = await ambil(data.total))
  return data.data.map(toPendaftaran)
}

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

export async function kirimPendaftaran(input: PendaftaranInput, signal?: AbortSignal): Promise<{ id: number }> {
  const body = new FormData()
  body.set('id_posisi', String(input.idPosisi))
  body.set('surat_dpa', input.suratDpa)
  body.set('cv', input.cv)
  for (const file of input.berkasTambahan) body.append('berkas_tambahan', file)
  const { data } = await api.post<{ id_pendaftaran: number }>(ENDPOINT, body, { signal })
  return { id: data.id_pendaftaran }
}

export async function konfirmasiPenerimaan(id: number, signal?: AbortSignal): Promise<PendaftaranDetail> {
  const { data } = await api.patch<PendaftaranDetailResponse>(`${ENDPOINT}/accept`, undefined, { params: { id }, signal })
  return { ...toPendaftaran(data), ...toTahapPendaftaran(data) }
}
