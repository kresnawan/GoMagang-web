import type { PendaftarQuery } from '../../../services/pendaftar'

export const ROWS_OPTIONS = [25, 50, 100, 250, 500] as const

const INT_MAX = 2_147_483_647

export const PARAM = {
  s: 's',
  periode: 'periode',
  status: 'status',
  perusahaan: 'perusahaan',
  posisi: 'posisi',
  r: 'r',
  p: 'p',
} as const

export const PARAM_FILTER = [PARAM.s, PARAM.periode, PARAM.status, PARAM.perusahaan, PARAM.posisi] as const

function toInt(value: string | null) {
  const n = Number(value)
  return value && Number.isInteger(n) && n > 0 && n <= INT_MAX ? n : undefined
}

export function parsePendaftarParams(params: URLSearchParams): PendaftarQuery {
  const r = Number(params.get(PARAM.r))
  return {
    p: toInt(params.get(PARAM.p)) ?? 1,
    r: (ROWS_OPTIONS as readonly number[]).includes(r) ? r : ROWS_OPTIONS[0],
    s: params.get(PARAM.s)?.trim() || undefined,
    periode: toInt(params.get(PARAM.periode)),
    status: toInt(params.get(PARAM.status)),
    perusahaan: toInt(params.get(PARAM.perusahaan)),
    posisi: toInt(params.get(PARAM.posisi)),
  }
}

export function kunciFilter(params: URLSearchParams) {
  return PARAM_FILTER.map((key) => params.get(key) ?? '').join('|')
}
