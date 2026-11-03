// Route data (tanpa tampilan) untuk dialog Detail: dimuat lewat fetcher.load, status diubah lewat fetcher.submit
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { STATUS_PENDAFTARAN, type StatusPendaftaran } from '../../../../services/pendaftaran'
import { getPendaftarDetail, PendaftarError, ubahStatusPendaftar } from '../../../../services/pendaftar'

export const detailPendaftarPath = (id: string) => `/tim-mb/pendaftar/${id}`

export async function loader({ params }: LoaderFunctionArgs) {
  const detail = await getPendaftarDetail(params.idPendaftar ?? '')
  if (!detail) throw data('Pendaftar tidak ditemukan', { status: 404 })
  return detail
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const statusBaru = String(formData.get('statusBaru'))
  if (!STATUS_PENDAFTARAN.includes(statusBaru as StatusPendaftaran)) {
    return data({ ok: false as const, error: 'Status tidak dikenal.' }, { status: 400 })
  }

  try {
    await ubahStatusPendaftar(params.idPendaftar ?? '', statusBaru as StatusPendaftaran)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof PendaftarError ? err.message : 'Gagal mengubah status. Coba lagi.'
    return data({ ok: false as const, error: message }, { status: 500 })
  }
}
