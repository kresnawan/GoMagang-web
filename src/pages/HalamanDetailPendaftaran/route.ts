import { isAxiosError } from 'axios'
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../services/http'
import { getPendaftaran, konfirmasiPenerimaan } from '../../services/pendaftaran'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const pendaftaran = await getPendaftaran(params.idPendaftaran ?? '', request.signal)
  if (!pendaftaran) throw data('Pendaftaran tidak ditemukan', { status: 404 })
  return pendaftaran
}

export const INTENT_KONFIRMASI = 'konfirmasi'

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  if (formData.get('intent') !== INTENT_KONFIRMASI) return gagal('Aksi tidak dikenal.', 400)

  const id = Number(params.idPendaftaran)
  if (!Number.isSafeInteger(id) || id < 1) return gagal('Pendaftaran tidak valid.', 400)

  try {
    await konfirmasiPenerimaan(id, request.signal)
    return { ok: true as const }
  } catch (err) {
    const status = isAxiosError(err) ? (err.response?.status ?? 500) : 500
    if (status === 404 || status === 403) return gagal('Pendaftaran tidak ditemukan.', status)
    return gagal(pesanError(err, 'Gagal mengonfirmasi penerimaan. Coba lagi.'), status)
  }
}
