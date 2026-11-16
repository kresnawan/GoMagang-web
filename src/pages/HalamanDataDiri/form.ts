import {
  JENIS_KELAMIN,
  PROGRAM_STUDI,
  type DataDiri,
  type DataDiriInput,
  type JenisKelamin,
  type ProgramStudi,
} from '../../services/dataDiri'

export const SEMESTER_MIN = 1
export const SEMESTER_MAX = 14

export type DataDiriFormValues = { [K in keyof DataDiriInput]: DataDiriInput[K] | null }

export function parseDataDiriForm(formData: FormData): DataDiriFormValues {
  const get = (key: keyof DataDiriInput) => String(formData.get(key) ?? '').trim() || null
  const toNumber = (value: string | null) => (value === null ? null : Number(value))
  const ipk = toNumber(get('ipk'))

  return {
    namaLengkap: get('namaLengkap'),
    nim: get('nim'),
    jenisKelamin: get('jenisKelamin') as JenisKelamin | null,
    programStudi: get('programStudi') as ProgramStudi | null,
    ipk: ipk === null ? null : Math.round(ipk * 100) / 100,
    semester: toNumber(get('semester')),
    nomorHp: get('nomorHp'),
  }
}

export function perubahanDataDiri(awal: DataDiri, values: DataDiriFormValues): Partial<DataDiriInput> {
  const changes: Partial<DataDiriInput> = {}
  for (const key of Object.keys(values) as Array<keyof DataDiriFormValues>) {
    const value = values[key]
    if (value !== null && !Object.is(awal[key], value)) Object.assign(changes, { [key]: value })
  }
  return changes
}

export function validateDataDiri(awal: DataDiri, values: DataDiriFormValues): string | null {
  const dikosongkan = (Object.keys(values) as Array<keyof DataDiriFormValues>).some(
    (key) => values[key] === null && awal[key] !== null,
  )
  if (dikosongkan) return 'Kolom yang sudah terisi tidak bisa dikosongkan.'

  const { namaLengkap, nim, nomorHp, jenisKelamin, programStudi, ipk, semester } = perubahanDataDiri(awal, values)
  if (namaLengkap !== undefined && namaLengkap.length > 255) return 'Nama lengkap maksimal 255 karakter.'
  if (nim !== undefined && !/^[0-9]{1,15}$/.test(nim)) return 'NIM harus 1–15 digit angka.'
  if (nomorHp !== undefined && !/^\+?[0-9]{9,15}$/.test(nomorHp)) {
    return 'Nomor HP harus 9–15 digit angka, boleh diawali +.'
  }
  if (jenisKelamin !== undefined && !JENIS_KELAMIN.includes(jenisKelamin)) return 'Jenis kelamin tidak valid.'
  if (programStudi !== undefined && !PROGRAM_STUDI.includes(programStudi)) return 'Program studi tidak valid.'
  if (ipk !== undefined && !(ipk >= 0 && ipk <= 4)) return 'IPK harus di antara 0 dan 4.'
  if (semester !== undefined && !(Number.isInteger(semester) && semester >= SEMESTER_MIN && semester <= SEMESTER_MAX)) {
    return `Semester harus bilangan bulat ${SEMESTER_MIN}–${SEMESTER_MAX}.`
  }
  return null
}
