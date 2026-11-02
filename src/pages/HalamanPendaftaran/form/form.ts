import { MAX_FILE_SIZE } from '../../../services/lowongan'

/** Berkas yang wajib diunggah; urutan di sini = urutan di form */
export const BERKAS = [
  { name: 'suratDpa', label: 'Surat Pernyataan DPA' },
  { name: 'cv', label: 'Berkas CV' },
] as const

export function validateBerkas(value: FormDataEntryValue | null, label: string): string | null {
  if (!(value instanceof File) || value.size === 0) return `${label} wajib diunggah.`
  if (value.type !== 'application/pdf' && !value.name.toLowerCase().endsWith('.pdf')) {
    return `${label} harus berformat PDF.`
  }
  if (value.size > MAX_FILE_SIZE) return `${label} maksimal ${MAX_FILE_SIZE / 1024 / 1024} MB.`
  return null
}

/** Dipakai di form (sebelum dialog konfirmasi) dan di action */
export function validatePendaftaranForm(formData: FormData): string | null {
  for (const berkas of BERKAS) {
    const error = validateBerkas(formData.get(berkas.name), berkas.label)
    if (error) return error
  }
  return null
}
