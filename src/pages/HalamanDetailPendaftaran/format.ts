const waktuFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
const tanggalPanjangFormat = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatWaktu = (iso: string) => waktuFormat.format(new Date(iso))

export const formatTanggal = (iso: string) => tanggalFormat.format(new Date(iso))

export const formatTanggalJadwal = (tanggal: string) => tanggalPanjangFormat.format(new Date(`${tanggal}T00:00`))

export function formatUkuran(byte: number) {
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024))} KB`
  return `${(byte / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}
