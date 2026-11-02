import {
  JENIS_KELAMIN,
  PROGRAM_STUDI,
  type DataDiriInput,
  type JenisKelamin,
  type ProgramStudi,
} from '../../services/dataDiri'

/** Ubah FormData dari form Data Diri menjadi objek bertipe */
export function parseDataDiriForm(formData: FormData): DataDiriInput {
  const get = (key: keyof DataDiriInput) => String(formData.get(key) ?? '').trim()
  const ipk = get('ipk')

  return {
    namaLengkap: get('namaLengkap'),
    nim: get('nim'),
    jenisKelamin: get('jenisKelamin') as JenisKelamin,
    programStudi: get('programStudi') as ProgramStudi,
    ipk: ipk === '' ? Number.NaN : Number(ipk),
    nomorHp: get('nomorHp'),
  }
}

/** Validasi ulang di sisi action (validasi native browser bisa dilewati) */
export function validateDataDiri(input: DataDiriInput): string | null {
  if (!input.namaLengkap || !input.nim || !input.nomorHp) return 'Semua kolom wajib diisi.'
  if (!JENIS_KELAMIN.includes(input.jenisKelamin)) return 'Jenis kelamin tidak valid.'
  if (!PROGRAM_STUDI.includes(input.programStudi)) return 'Program studi tidak valid.'
  if (!(input.ipk >= 0 && input.ipk <= 4)) return 'IPK harus di antara 0 dan 4.'
  return null
}

export function isSameDataDiri(a: DataDiriInput, b: DataDiriInput) {
  return (Object.keys(a) as Array<keyof DataDiriInput>).every((key) => Object.is(a[key], b[key]))
}
