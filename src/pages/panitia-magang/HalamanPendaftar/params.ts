import type { PendaftarQuery } from '../../../services/pendaftar'

export const ROWS_OPTIONS = [25, 50, 100, 250, 500] as const

/** Batas atas bilangan bulat di query backend (integer 32-bit); di atasnya backend menolak dengan 400 */
const INT_MAX = 2_147_483_647

/**
 * Nama query param di URL, sama persis dengan query GET /api/v1/pendaftaran,
 * sehingga URL halaman bisa diteruskan apa adanya ke backend
 */
export const PARAM = {
  s: 's',
  periode: 'periode',
  status: 'status',
  perusahaan: 'perusahaan',
  posisi: 'posisi',
  r: 'r',
  p: 'p',
} as const

/** Param yang termasuk filter; perubahan di sini mereset pilihan & halaman */
export const PARAM_FILTER = [PARAM.s, PARAM.periode, PARAM.status, PARAM.perusahaan, PARAM.posisi] as const

/** Bilangan bulat 1..INT_MAX; selain itu undefined (tidak dikirim, agar backend tidak menolak dengan 400) */
function toInt(value: string | null) {
  const n = Number(value)
  return value && Number.isInteger(n) && n > 0 && n <= INT_MAX ? n : undefined
}

/** URL halaman → query backend. Nilai yang tidak valid dibuang, sehingga backend memakai bawaannya */
export function parsePendaftarParams(params: URLSearchParams): PendaftarQuery {
  const r = Number(params.get(PARAM.r))
  return {
    p: toInt(params.get(PARAM.p)) ?? 1,
    // Dibatasi ke pilihan dropdown Rows; bawaannya 25, sama dengan backend
    r: (ROWS_OPTIONS as readonly number[]).includes(r) ? r : ROWS_OPTIONS[0],
    s: params.get(PARAM.s)?.trim() || undefined,
    periode: toInt(params.get(PARAM.periode)),
    status: toInt(params.get(PARAM.status)),
    perusahaan: toInt(params.get(PARAM.perusahaan)),
    posisi: toInt(params.get(PARAM.posisi)),
  }
}

/** Kunci unik filter aktif; pilihan checkbox direset bila kunci ini berubah */
export function kunciFilter(params: URLSearchParams) {
  return PARAM_FILTER.map((key) => params.get(key) ?? '').join('|')
}
