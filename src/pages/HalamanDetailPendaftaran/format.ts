const waktuFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
const tanggalPanjangFormat = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

/** "25 Okt 2026, 10.30" */
export const formatWaktu = (iso: string) => waktuFormat.format(new Date(iso))

/** "25 Oktober 2026" */
export const formatTanggal = (iso: string) => tanggalFormat.format(new Date(iso))

/** "Rabu, 29 Oktober 2026" dari "2026-10-29" (tanggal lokal, tanpa zona waktu) */
export const formatTanggalJadwal = (tanggal: string) => tanggalPanjangFormat.format(new Date(`${tanggal}T00:00`))

/** "356 KB" */
export function formatUkuran(byte: number) {
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024))} KB`
  return `${(byte / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}
