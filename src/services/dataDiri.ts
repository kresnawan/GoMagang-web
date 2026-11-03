// MOCK: backend belum tersedia. Ganti isi getDataDiri/updateDataDiri dengan fetch ke API
// asli; tipe & signature fungsi dibiarkan sama agar halaman tidak perlu diubah.

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

export type DataDiri = {
  namaLengkap: string
  nim: string
  email: string
  jenisKelamin: JenisKelamin
  programStudi: ProgramStudi
  ipk: number
  nomorHp: string
}

/** Field yang boleh diubah pengguna (email dikunci) */
export type DataDiriInput = Omit<DataDiri, 'email'>

let store: DataDiri = {
  namaLengkap: 'Budi Santoso',
  nim: '215150200111001',
  email: 'budi.santoso@student.ac.id',
  jenisKelamin: 'Laki-laki',
  programStudi: 'Teknik Informatika',
  ipk: 3.5,
  nomorHp: '081234567890',
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getDataDiri(_signal?: AbortSignal): Promise<DataDiri> {
  await delay(600)
  return { ...store }
}

export async function updateDataDiri(input: DataDiriInput): Promise<DataDiri> {
  await delay(600)
  store = { ...store, ...input }
  return { ...store }
}
