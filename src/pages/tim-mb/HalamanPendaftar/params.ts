import { STATUS_PENDAFTARAN, type StatusPendaftaran } from '../../../services/pendaftaran'
import { KOLOM_CARI, type KolomCari, type PendaftarFilter } from '../../../services/pendaftar'

export const ROWS_OPTIONS = [25, 50, 100, 250, 500] as const

/** Nama query param di URL */
export const PARAM = {
  q: 'q',
  cariBerdasarkan: 'cari',
  periode: 'periode',
  status: 'status',
  rows: 'rows',
  halaman: 'hal',
} as const

/** Param yang termasuk filter; perubahan di sini mereset pilihan & halaman */
export const PARAM_FILTER = [PARAM.q, PARAM.cariBerdasarkan, PARAM.periode, PARAM.status] as const

export function parsePendaftarParams(params: URLSearchParams) {
  const cari = params.get(PARAM.cariBerdasarkan)
  const status = params.get(PARAM.status)
  const rows = Number(params.get(PARAM.rows))
  const halaman = Number(params.get(PARAM.halaman))

  const filter: PendaftarFilter = {
    q: params.get(PARAM.q)?.trim() || undefined,
    cariBerdasarkan: KOLOM_CARI.some((item) => item.value === cari) ? (cari as KolomCari) : 'nama',
    idPeriode: params.get(PARAM.periode) || undefined,
    status: STATUS_PENDAFTARAN.includes(status as StatusPendaftaran) ? (status as StatusPendaftaran) : undefined,
  }

  return {
    filter,
    rows: (ROWS_OPTIONS as readonly number[]).includes(rows) ? rows : ROWS_OPTIONS[0],
    halaman: Number.isInteger(halaman) && halaman > 0 ? halaman : 1,
  }
}

/** Kunci unik filter aktif; pilihan checkbox direset bila kunci ini berubah */
export function kunciFilter(params: URLSearchParams) {
  return PARAM_FILTER.map((key) => params.get(key) ?? '').join('|')
}
