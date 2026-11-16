import type { LoaderFunctionArgs } from 'react-router'
import { getPendaftaranList } from '../../services/pendaftaran'
import { getPeriode } from '../../services/periode'

export async function loader({ request }: LoaderFunctionArgs) {
  const [pendaftaran, periode] = await Promise.all([
    getPendaftaranList(request.signal),
    getPeriode(request.signal, 'berlangsung').catch(() => null),
  ])
  const periodeBerjalan = periode === null ? undefined : (periode[0] ?? null)
  return { pendaftaran, periodeBerjalan }
}
