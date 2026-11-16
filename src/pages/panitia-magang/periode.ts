import type { Periode, StatusPeriode as StatusPeriodeApi } from '../../services/periode'

const ZONA = 'Asia/Jakarta'
const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA })
const waktuFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: ZONA })

export const CATATAN_MAX = 255

export function wibKeIso(value: FormDataEntryValue | null) {
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(:\d{2})?$/.exec(String(value ?? ''))
  if (!match) return null
  const iso = `${match[1]}${match[2] ?? ':00'}+07:00`
  return Number.isNaN(Date.parse(iso)) ? null : iso
}

export function labelPeriode(periode: Pick<Periode, 'catatan' | 'waktuMulai' | 'waktuTutup'>) {
  const rentang = tanggalFormat.formatRange(new Date(periode.waktuMulai), new Date(periode.waktuTutup))
  return periode.catatan ? `${periode.catatan} (${rentang})` : rentang
}

export const formatWaktuPeriode = (iso: string) => waktuFormat.format(new Date(iso))

export type StatusPeriode = 'Akan datang' | 'Berjalan' | 'Selesai'

export const LABEL_STATUS_PERIODE: Record<StatusPeriodeApi, StatusPeriode> = {
  belum_dimulai: 'Akan datang',
  berlangsung: 'Berjalan',
  selesai: 'Selesai',
}
