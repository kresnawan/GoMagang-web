import type { LoaderFunctionArgs } from 'react-router'
import { getPosisiList, type PosisiFilter } from '../../../services/lowongan'
import { getRiwayatPendaftaran } from '../../../services/pendaftaran'
import { getPeriode } from '../../../services/periode'

export function parsePosisiFilter(params: URLSearchParams): PosisiFilter {
  return { q: params.get('q')?.trim() || undefined }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const filter = parsePosisiFilter(new URL(request.url).searchParams)

  const [periode, posisi, riwayat] = await Promise.all([
    getPeriode(request.signal, 'berlangsung'),
    getPosisiList(filter, request.signal),
    getRiwayatPendaftaran(request.signal),
  ])

  const periodeBerjalan = periode[0] ?? null
  return { filter, periodeBerjalan, posisi: periodeBerjalan ? posisi : [], riwayat }
}
