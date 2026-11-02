import type { LoaderFunctionArgs } from 'react-router'
import {
  BIDANG,
  getLowonganList,
  LOKASI,
  SISTEM_KERJA,
  URUTAN,
  type LowonganFilter,
} from '../../../services/lowongan'

/** Ambil nilai param hanya jika termasuk pilihan yang valid */
function pick<T extends string>(params: URLSearchParams, key: string, options: readonly T[]) {
  const value = params.get(key)
  return options.includes(value as T) ? (value as T) : undefined
}

export function parseLowonganFilter(params: URLSearchParams): LowonganFilter {
  return {
    q: params.get('q')?.trim() || undefined,
    bidang: pick(params, 'bidang', BIDANG),
    lokasi: pick(params, 'lokasi', LOKASI),
    sistemKerja: pick(params, 'sistemKerja', SISTEM_KERJA),
    urutkan: pick(
      params,
      'urutkan',
      URUTAN.map((item) => item.value),
    ),
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return getLowonganList(parseLowonganFilter(new URL(request.url).searchParams))
}
