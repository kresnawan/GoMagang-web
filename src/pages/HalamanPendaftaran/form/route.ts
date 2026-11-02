import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { getLowongan } from '../../../services/lowongan'
import { PendaftaranError, submitPendaftaran } from '../../../services/pendaftaran'
import { validatePendaftaranForm } from './form'

export async function loader({ params }: LoaderFunctionArgs) {
  const lowongan = await getLowongan(params.lowonganId ?? '')
  if (!lowongan) throw data('Lowongan tidak ditemukan', { status: 404 })
  return lowongan
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()

  const error = validatePendaftaranForm(formData)
  if (error) return data({ ok: false as const, error }, { status: 400 })

  try {
    await submitPendaftaran({
      lowonganId: params.lowonganId ?? '',
      suratDpa: formData.get('suratDpa') as File,
      cv: formData.get('cv') as File,
    })
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof PendaftaranError ? err.message : 'Gagal mengirim pendaftaran. Coba lagi.'
    return data({ ok: false as const, error: message }, { status: 500 })
  }
}
