import type { StatusPendaftaran } from '../../services/pendaftaran'

type Tone = 'warning' | 'success' | 'danger' | 'neutral'

const STATUS_TONE: Record<StatusPendaftaran, Tone> = {
  'Menunggu Verifikasi': 'warning',
  'Lolos Seleksi Administrasi': 'success',
  Diterima: 'success',
  Aktif: 'success',
  Selesai: 'neutral',
  'Tidak Lolos': 'danger',
  'Batal/Mengundurkan Diri': 'danger',
}

const TONE_CLASS: Record<Tone, { text: string; dot: string; badge: string }> = {
  warning: { text: 'text-amber-700', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-800 ring-amber-200' },
  success: { text: 'text-green-700', dot: 'bg-green-600', badge: 'bg-green-50 text-green-800 ring-green-200' },
  danger: { text: 'text-red-700', dot: 'bg-red-600', badge: 'bg-red-50 text-red-800 ring-red-200' },
  neutral: { text: 'text-brand-700', dot: 'bg-brand-700', badge: 'bg-brand-100 text-brand-700 ring-brand-300' },
}

export function statusToneClass(status: StatusPendaftaran) {
  return TONE_CLASS[STATUS_TONE[status]]
}
