import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import { getPosisi } from '../../../services/lowongan'
import { alasanTidakBisaDaftar, getRiwayatPendaftaran, kirimPendaftaran } from '../../../services/pendaftaran'
import { getTemplatSpDpa } from '../../../services/templatSpDpa'
import { getBerkasTambahan, validatePendaftaranForm } from './form'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const [posisi, riwayat, templatSpDpa] = await Promise.all([
    getPosisi(Number(params.lowonganId), request.signal),
    getRiwayatPendaftaran(request.signal),
    getTemplatSpDpa(request.signal).catch(() => null),
  ])
  if (!posisi) throw data('Lowongan tidak ditemukan', { status: 404 })
  return { lowongan: posisi, alasanTidakBisaDaftar: alasanTidakBisaDaftar(riwayat, posisi), templatSpDpa }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()

  const error = validatePendaftaranForm(formData)
  if (error) return data({ ok: false as const, error }, { status: 400 })

  try {
    await kirimPendaftaran(
      {
        idPosisi: Number(params.lowonganId),
        suratDpa: formData.get('suratDpa') as File,
        cv: formData.get('cv') as File,
        berkasTambahan: getBerkasTambahan(formData),
      },
      request.signal,
    )
    return { ok: true as const }
  } catch (err) {
    return data({ ok: false as const, error: pesanError(err, 'Gagal mengirim pendaftaran. Coba lagi.') }, { status: 500 })
  }
}
