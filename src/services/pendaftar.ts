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
  idPeriode: number
  status: StatusPendaftaran
  diajukanPada: string
  diubahPada: string
  adaJadwalSeleksi: boolean
  adaPlottingDpm: boolean
}

export type PendaftarQuery = {
  p: number
  r: number
  s?: string
  periode?: number
  status?: number
  perusahaan?: number
  posisi?: number
}

export type PendaftarHalaman = {
  items: Pendaftar[]
  total: number
}

export type PendaftarRingkas = Pick<Pendaftar, 'id' | 'status' | 'nama' | 'nim' | 'adaJadwalSeleksi' | 'adaPlottingDpm'>

export type BerkasPendaftar = BerkasPendaftaran

export type PendaftarDetail = Omit<Pendaftar, 'adaJadwalSeleksi' | 'adaPlottingDpm'> & {
  email: string | null
  jenisKelamin: string | null
  programStudi: string | null
  ipk: number | null
  semester: number | null
  nomorHp: string | null
  berkas: BerkasPendaftar[]
  log: LogStatus[]
  jadwalSeleksi: JadwalSeleksiSubstansi | null
  suratKeterangan: SuratKeterangan | null
  plottingDpm: PlottingDpm | null
}

export const TRANSISI_PANITIA_MAGANG: Record<StatusPendaftaran, StatusPendaftaran[]> = {
  'Menunggu Verifikasi': ['Lolos Seleksi Administrasi', 'Tidak Lolos'],
  'Lolos Seleksi Administrasi': ['Diterima', 'Tidak Lolos'],
  Diterima: [],
  Aktif: ['Selesai'],
  Selesai: [],
  'Tidak Lolos': [],
  'Batal/Mengundurkan Diri': [],
}

const ENDPOINT = '/pendaftaran'

function toPendaftarDasar(res: PendaftaranResponse): Omit<Pendaftar, 'adaJadwalSeleksi' | 'adaPlottingDpm'> {
  return {
    id: res.id_pendaftaran,
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

export async function getHalamanPendaftar(query: PendaftarQuery, signal?: AbortSignal): Promise<PendaftarHalaman> {
  const { data } = await api.get<HalamanPendaftaranResponse>(ENDPOINT, { params: query, signal })
  return { items: data.data.map(toPendaftar), total: data.total }
}

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

export const FORMAT_EKSPOR = [{ format: 'xlsx', label: 'Excel (.xlsx)' }] as const

export type FormatEkspor = (typeof FORMAT_EKSPOR)[number]['format']

export const MAX_EKSPOR = 10_000

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

export async function ubahStatusPendaftar(id: number, status: StatusPendaftaran, signal?: AbortSignal): Promise<PendaftarDetail> {
  const { data } = await api.patch<PendaftaranDetailResponse>(ENDPOINT, { status }, { params: { id }, signal })
  return toPendaftarDetail(data)
}

export const LOKASI_JADWAL_MAX = 255

export type JadwalSeleksiInput = {
  idPendaftar: number[]
  tanggal: string
  jam: string
  lokasi: string
}

export const hariIniWib = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())

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

export async function simpanJadwalSeleksi(input: JadwalSeleksiInput, signal?: AbortSignal): Promise<void> {
  await api.put(
    `${ENDPOINT}/jadwal-seleksi-substansi`,
    { id_pendaftaran: input.idPendaftar, tanggal: input.tanggal, jam: input.jam, lokasi: input.lokasi.trim() },
    { signal },
  )
}

export const DPM_TEKS_MAX = 255

export type PlottingDpmInput = {
  idPendaftar: number[]
  namaDpm: string
  kontakDpm: string
}

export function validasiPlottingDpm(input: PlottingDpmInput): string | null {
  if (input.idPendaftar.length === 0) return 'Pilih minimal satu pendaftaran.'
  const panjangValid = (teks: string) => teks.trim().length >= 1 && teks.trim().length <= DPM_TEKS_MAX
  if (!panjangValid(input.namaDpm)) return `Nama DPM harus berisi 1-${DPM_TEKS_MAX} karakter.`
  if (!panjangValid(input.kontakDpm)) return `Kontak DPM harus berisi 1-${DPM_TEKS_MAX} karakter.`
  return null
}

export async function simpanPlottingDpm(input: PlottingDpmInput, signal?: AbortSignal): Promise<void> {
  await api.put(
    `${ENDPOINT}/plot-dpm`,
    { id_pendaftaran: input.idPendaftar, nama_dpm: input.namaDpm.trim(), kontak_dpm: input.kontakDpm.trim() },
    { signal },
  )
}
