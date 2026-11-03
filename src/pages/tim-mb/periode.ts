import type { PeriodePendaftaran } from '../../services/posisiMagang'

const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const waktuFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

/** "Periode Ganjil 2026/2027 (1 Okt – 30 Nov 2026)" */
export function labelPeriode(periode: PeriodePendaftaran) {
  const rentang = tanggalFormat.formatRange(new Date(periode.waktuMulai), new Date(periode.waktuTutup))
  return periode.catatan ? `${periode.catatan} (${rentang})` : rentang
}

/** "1 Okt 2026, 00.00" */
export const formatWaktuPeriode = (iso: string) => waktuFormat.format(new Date(iso))

export type StatusPeriode = 'Akan datang' | 'Berjalan' | 'Selesai'

export function statusPeriode(periode: PeriodePendaftaran, sekarang = Date.now()): StatusPeriode {
  if (sekarang < Date.parse(periode.waktuMulai)) return 'Akan datang'
  if (sekarang > Date.parse(periode.waktuTutup)) return 'Selesai'
  return 'Berjalan'
}

/** Periode yang sedang berjalan; jika tidak ada, periode terbaru (daftar sudah urut terbaru dulu) */
export function periodeDefault(periode: PeriodePendaftaran[], sekarang = Date.now()) {
  return periode.find((item) => statusPeriode(item, sekarang) === 'Berjalan') ?? periode[0] ?? null
}
