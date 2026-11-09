import type { LoaderFunctionArgs } from 'react-router'
import { getBerkasPublik, kedaluwarsaToken, type BerkasPublik } from '../../services/berkas'
import { pesanError } from '../../services/http'

export type HasilBerkas =
  | { status: 'ok'; berkas: BerkasPublik; berlakuSampai: Date | null }
  | { status: 'kedaluwarsa'; berlakuSampai: Date }
  | { status: 'tidak-ditemukan' }
  | { status: 'gagal'; pesan: string }

/**
 * Dibuka dari link di file Excel hasil ekspor Tim MB: /berkas/{token}. Link yang sudah lewat masanya tidak
 * perlu dikirim ke backend; sisanya (diubah, dihapus, dll.) dijawab 404 oleh backend
 */
export async function loader({ request, params }: LoaderFunctionArgs): Promise<HasilBerkas> {
  const token = params.token ?? ''
  const berlakuSampai = kedaluwarsaToken(token)
  if (berlakuSampai && berlakuSampai.getTime() <= Date.now()) return { status: 'kedaluwarsa', berlakuSampai }

  try {
    const berkas = await getBerkasPublik(token, request.signal)
    return berkas ? { status: 'ok', berkas, berlakuSampai } : { status: 'tidak-ditemukan' }
  } catch (err) {
    return { status: 'gagal', pesan: pesanError(err, 'Gagal membuka berkas. Coba muat ulang halaman ini.') }
  }
}
