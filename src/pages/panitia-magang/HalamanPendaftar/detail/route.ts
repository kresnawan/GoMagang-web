import { isAxiosError } from 'axios'
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../../services/http'
import { STATUS_PENDAFTARAN, type StatusPendaftaran } from '../../../../services/pendaftaran'
import { getPendaftarDetail, ubahStatusPendaftar } from '../../../../services/pendaftar'

export const detailPendaftarPath = (id: number) => `/panitia-magang/pendaftar/${id}`

export async function loader({ params, request }: LoaderFunctionArgs) {
  const detail = await getPendaftarDetail(Number(params.idPendaftar), request.signal)
  if (!detail) throw data('Pendaftar tidak ditemukan', { status: 404 })
  return detail
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

const isStatus = (value: unknown): value is StatusPendaftaran =>
  STATUS_PENDAFTARAN.includes(value as StatusPendaftaran)

export async function action({ request, params }: ActionFunctionArgs) {
  const id = Number(params.idPendaftar)
  if (!Number.isSafeInteger(id) || id < 1) return gagal('Pendaftar tidak valid.', 400)

  const formData = await request.formData()
  const statusBaru = formData.get('statusBaru')
  if (!isStatus(statusBaru)) return gagal('Status tidak dikenal.', 400)

  try {
    await ubahStatusPendaftar(id, statusBaru, request.signal)
    return { ok: true as const }
  } catch (err) {
    const status = isAxiosError(err) ? (err.response?.status ?? 500) : 500
    if (status === 404) return gagal('Pendaftar tidak ditemukan.', 404)
    return gagal(pesanError(err, 'Gagal mengubah status. Coba lagi.'), status)
  }
}
