import type { LoaderFunctionArgs } from 'react-router'
import { getPendaftaranList } from '../../services/pendaftaran'

/** Semua pendaftaran milik mahasiswa yang login (semua status), dari yang paling baru */
export async function loader({ request }: LoaderFunctionArgs) {
  return getPendaftaranList(request.signal)
}
