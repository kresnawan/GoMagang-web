import { MAX_FILE_SIZE } from '../../../services/lowongan'
import { MAX_BERKAS_TAMBAHAN } from '../../../services/pendaftaran'

/** Berkas yang wajib diunggah; urutan di sini = urutan di form */
export const BERKAS = [
  { name: 'suratDpa', label: 'Surat Pernyataan DPA' },
  { name: 'cv', label: 'Berkas CV' },
] as const

/** Portfolio & berkas tambahan: opsional, boleh lebih dari satu file */
export const BERKAS_TAMBAHAN = { name: 'berkasTambahan', label: 'Portfolio dan berkas tambahan' } as const

/** Cek format & ukuran satu file PDF; null bila valid */
function validatePdf(file: File, label: string): string | null {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return `${label} harus berformat PDF.`
  }
  if (file.size > MAX_FILE_SIZE) return `${label} maksimal ${MAX_FILE_SIZE / 1024 / 1024} MB.`
  return null
}

export function validateBerkas(value: FormDataEntryValue | null, label: string): string | null {
  if (!(value instanceof File) || value.size === 0) return `${label} wajib diunggah.`
  return validatePdf(value, label)
}

/** File berkas tambahan yang dipilih (input kosong di FormData berupa File tanpa isi, dilewati) */
export function getBerkasTambahan(formData: FormData): File[] {
  return formData.getAll(BERKAS_TAMBAHAN.name).filter((value): value is File => value instanceof File && value.size > 0)
}

/** Dipakai di form (sebelum dialog konfirmasi) dan di action */
export function validatePendaftaranForm(formData: FormData): string | null {
  for (const berkas of BERKAS) {
    const error = validateBerkas(formData.get(berkas.name), berkas.label)
    if (error) return error
  }
  const tambahan = getBerkasTambahan(formData)
  if (tambahan.length > MAX_BERKAS_TAMBAHAN) {
    return `${BERKAS_TAMBAHAN.label} maksimal ${MAX_BERKAS_TAMBAHAN} file.`
  }
  for (const file of tambahan) {
    const error = validatePdf(file, `Berkas "${file.name}"`)
    if (error) return error
  }
  return null
}
