import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { getPendaftaran, konfirmasiPenerimaan, PendaftaranError } from '../../services/pendaftaran'

export async function loader({ params }: LoaderFunctionArgs) {
  const pendaftaran = await getPendaftaran(params.idPendaftaran ?? '')
  if (!pendaftaran) throw data('Pendaftaran tidak ditemukan', { status: 404 })
  return pendaftaran
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  if (formData.get('intent') !== 'konfirmasi') {
    return data({ ok: false as const, error: 'Aksi tidak dikenal.' }, { status: 400 })
  }

  try {
    await konfirmasiPenerimaan(params.idPendaftaran ?? '')
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof PendaftaranError ? err.message : 'Gagal mengonfirmasi penerimaan. Coba lagi.'
    return data({ ok: false as const, error: message }, { status: 500 })
  }
}
