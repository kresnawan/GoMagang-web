import type { StatusPendaftaran } from '../../services/pendaftaran'

type Tone = 'warning' | 'success' | 'danger'

const STATUS_TONE: Record<StatusPendaftaran, Tone> = {
  'Menunggu Verifikasi': 'warning',
  'Lolos Seleksi Administrasi': 'success',
  Diterima: 'success',
  Aktif: 'success',
  'Tidak Lolos': 'danger',
  'Batal/Mengundurkan Diri': 'danger',
}

const TONE_CLASS: Record<Tone, { text: string; dot: string }> = {
  warning: { text: 'text-amber-700', dot: 'bg-amber-400' },
  success: { text: 'text-green-700', dot: 'bg-green-600' },
  danger: { text: 'text-red-700', dot: 'bg-red-600' },
}

/** Class warna untuk sebuah status (teks & isi titik) */
export function statusToneClass(status: StatusPendaftaran) {
  return TONE_CLASS[STATUS_TONE[status]]
}
