import type { LoaderFunctionArgs } from 'react-router'
import { getPosisiList, type PosisiFilter } from '../../../services/lowongan'
import { getPeriode } from '../../../services/periode'

export function parsePosisiFilter(params: URLSearchParams): PosisiFilter {
  return { q: params.get('q')?.trim() || undefined }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const filter = parsePosisiFilter(new URL(request.url).searchParams)

  // Paralel: tanpa id_periode backend memakai periode berjalan (yang mulai paling akhir), sama dengan
  // periode[0] di sini. Posisi saja tidak cukup karena [] bisa berarti "belum dibuka" atau "belum ada lowongan".
  const [periode, posisi] = await Promise.all([
    getPeriode(request.signal, 'berlangsung'),
    getPosisiList(filter, request.signal),
  ])

  /** null: tidak ada periode pendaftaran yang sedang berlangsung */
  const periodeBerjalan = periode[0] ?? null
  return { filter, periodeBerjalan, posisi: periodeBerjalan ? posisi : [] }
}
