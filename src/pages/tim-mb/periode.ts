import type { StatusPeriode as StatusPeriodeApi } from '../../services/periode'
import type { PeriodePendaftaran } from '../../services/posisiMagang'

// Waktu periode disimpan & ditampilkan dalam WIB, apa pun zona waktu browser
const ZONA = 'Asia/Jakarta'
const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA })
const waktuFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: ZONA })

export const CATATAN_MAX = 255

/**
 * Nilai <input type="datetime-local"> ("2026-10-01T08:00") dibaca sebagai WIB
 * → "2026-10-01T08:00:00+07:00", atau null jika kosong/tidak valid
 */
export function wibKeIso(value: FormDataEntryValue | null) {
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(:\d{2})?$/.exec(String(value ?? ''))
  if (!match) return null
  const iso = `${match[1]}${match[2] ?? ':00'}+07:00`
  return Number.isNaN(Date.parse(iso)) ? null : iso
}

/** "Periode Ganjil 2026/2027 (1 Okt – 30 Nov 2026)" */
export function labelPeriode(periode: Pick<PeriodePendaftaran, 'catatan' | 'waktuMulai' | 'waktuTutup'>) {
  const rentang = tanggalFormat.formatRange(new Date(periode.waktuMulai), new Date(periode.waktuTutup))
  return periode.catatan ? `${periode.catatan} (${rentang})` : rentang
}

/** "1 Okt 2026, 00.00" */
export const formatWaktuPeriode = (iso: string) => waktuFormat.format(new Date(iso))

export type StatusPeriode = 'Akan datang' | 'Berjalan' | 'Selesai'

/** Label status periode dari backend */
export const LABEL_STATUS_PERIODE: Record<StatusPeriodeApi, StatusPeriode> = {
  belum_dimulai: 'Akan datang',
  berlangsung: 'Berjalan',
  selesai: 'Selesai',
}
