// Data diri mahasiswa yang sedang login: GET & PATCH /api/v1/mahasiswa/data.

import { api } from './http'

export const JENIS_KELAMIN = ['Laki-laki', 'Perempuan'] as const
export type JenisKelamin = (typeof JENIS_KELAMIN)[number]

export const PROGRAM_STUDI = [
  'Sistem Informasi',
  'Teknologi Informasi',
  'Pendidikan Teknologi Informasi',
  'Teknik Komputer',
  'Teknik Informatika',
] as const
export type ProgramStudi = (typeof PROGRAM_STUDI)[number]

/**
 * Data diri dari backend. Kolom bisa null saat mahasiswa belum pernah mengisinya
 * (login pertama hanya membuat baris kosong).
 */
export type DataDiri = {
  namaLengkap: string | null
  nim: string | null
  email: string
  jenisKelamin: JenisKelamin | null
  programStudi: ProgramStudi | null
  ipk: number | null
  semester: number | null
  nomorHp: string | null
}

/** Field yang dikirim saat menyimpan (email dikunci); semuanya wajib diisi */
export type DataDiriInput = {
  [K in Exclude<keyof DataDiri, 'email'>]: NonNullable<DataDiri[K]>
}

/** Label kolom data diri, dipakai untuk pesan ke pengguna */
export const LABEL_DATA_DIRI: Record<keyof DataDiriInput, string> = {
  namaLengkap: 'Nama Lengkap',
  nim: 'NIM',
  jenisKelamin: 'Jenis Kelamin',
  programStudi: 'Program Studi',
  ipk: 'IPK',
  semester: 'Semester',
  nomorHp: 'Nomor HP',
}

/** Label kolom yang belum diisi; array kosong = data diri sudah lengkap */
export function kolomBelumDiisi(data: DataDiri): string[] {
  return (Object.keys(LABEL_DATA_DIRI) as Array<keyof DataDiriInput>)
    .filter((key) => data[key] === null)
    .map((key) => LABEL_DATA_DIRI[key])
}

/** Bentuk response GET /api/v1/mahasiswa/data */
type MahasiswaResponse = {
  nim: string | null
  email: string
  nama: string | null
  program_studi: string | null
  ipk: number | null
  no_hp: string | null
  jenis_kelamin: string | null
  semester: number | null
}

export const JENIS_KELAMIN_DARI_KODE: Record<string, JenisKelamin> = { L: 'Laki-laki', P: 'Perempuan' }
const KODE_JENIS_KELAMIN: Record<JenisKelamin, 'L' | 'P'> = { 'Laki-laki': 'L', Perempuan: 'P' }

const ENDPOINT = '/api/v1/mahasiswa/data'

const isProgramStudi = (value: string | null): value is ProgramStudi =>
  (PROGRAM_STUDI as readonly (string | null)[]).includes(value)

function toDataDiri(res: MahasiswaResponse): DataDiri {
  return {
    namaLengkap: res.nama,
    nim: res.nim,
    email: res.email,
    jenisKelamin: (res.jenis_kelamin && JENIS_KELAMIN_DARI_KODE[res.jenis_kelamin]) || null,
    // Nilai di luar daftar dianggap belum diisi, agar dropdown tidak diam-diam memilih opsi pertama
    programStudi: isProgramStudi(res.program_studi) ? res.program_studi : null,
    ipk: res.ipk,
    semester: res.semester,
    nomorHp: res.no_hp,
  }
}

export async function getDataDiri(signal?: AbortSignal): Promise<DataDiri> {
  const { data } = await api.get<MahasiswaResponse>(ENDPOINT, { signal })
  return toDataDiri(data)
}

/** Body PATCH: nama kolom backend, nilai tidak boleh null */
type MahasiswaPatch = Partial<{
  nim: string
  nama: string
  program_studi: string
  ipk: number
  no_hp: string
  jenis_kelamin: 'L' | 'P'
  semester: number
}>

function toPatch(changes: Partial<DataDiriInput>): MahasiswaPatch {
  const body: MahasiswaPatch = {}
  if (changes.nim !== undefined) body.nim = changes.nim
  if (changes.namaLengkap !== undefined) body.nama = changes.namaLengkap
  if (changes.programStudi !== undefined) body.program_studi = changes.programStudi
  if (changes.ipk !== undefined) body.ipk = changes.ipk
  if (changes.nomorHp !== undefined) body.no_hp = changes.nomorHp
  if (changes.jenisKelamin !== undefined) body.jenis_kelamin = KODE_JENIS_KELAMIN[changes.jenisKelamin]
  if (changes.semester !== undefined) body.semester = changes.semester
  return body
}

/**
 * Simpan HANYA kolom yang berubah (field yang tidak dikirim tidak diubah backend).
 * Error 409/422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError).
 */
export async function updateDataDiri(changes: Partial<DataDiriInput>, signal?: AbortSignal): Promise<DataDiri> {
  const { data } = await api.patch<MahasiswaResponse>(ENDPOINT, toPatch(changes), { signal })
  return toDataDiri(data)
}
