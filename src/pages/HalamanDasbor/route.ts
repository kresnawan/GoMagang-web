import type { LoaderFunctionArgs } from 'react-router'
import { getPendaftaranList } from '../../services/pendaftaran'
import { getPeriode } from '../../services/periode'

/** Semua pendaftaran milik mahasiswa yang login (semua status, dari yang paling baru) + periode yang berlangsung */
export async function loader({ request }: LoaderFunctionArgs) {
  const [pendaftaran, periode] = await Promise.all([
    getPendaftaranList(request.signal),
    // Hanya untuk ringkasan jatah mendaftar: bila gagal, dasbor tetap tampil tanpa ringkasan itu
    getPeriode(request.signal, 'berlangsung').catch(() => null),
  ])
  /** undefined: gagal dimuat; null: tidak ada periode yang berlangsung */
  const periodeBerjalan = periode === null ? undefined : (periode[0] ?? null)
  return { pendaftaran, periodeBerjalan }
}
