const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const jamFormat = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const relatifFormat = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })

const MENIT = 60_000
const JAM = 60 * MENIT
const HARI = 24 * JAM

export const formatTanggal = (iso: string) => tanggalFormat.format(new Date(iso))

export const formatJam = (iso: string) => jamFormat.format(new Date(iso)).replace('.', ':')

export const formatTanggalJam = (iso: string) => `${formatTanggal(iso)}, ${formatJam(iso)}`

export function formatRelatif(iso: string, sekarang = Date.now()) {
  const selisih = new Date(iso).getTime() - sekarang
  const abs = Math.abs(selisih)
  if (abs < MENIT) return 'baru saja'
  if (abs < JAM) return relatifFormat.format(Math.round(selisih / MENIT), 'minute')
  if (abs < HARI) return relatifFormat.format(Math.round(selisih / JAM), 'hour')
  if (abs < 30 * HARI) return relatifFormat.format(Math.round(selisih / HARI), 'day')
  return formatTanggal(iso)
}
