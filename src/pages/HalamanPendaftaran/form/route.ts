import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import { getPosisi } from '../../../services/lowongan'
import { alasanTidakBisaDaftar, getPendaftaranBerjalan, kirimPendaftaran } from '../../../services/pendaftaran'
import { getBerkasTambahan, validatePendaftaranForm } from './form'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const [posisi, berjalan] = await Promise.all([
    getPosisi(Number(params.lowonganId), request.signal),
    getPendaftaranBerjalan(request.signal),
  ])
  if (!posisi) throw data('Lowongan tidak ditemukan', { status: 404 })
  return { lowongan: posisi, alasanTidakBisaDaftar: alasanTidakBisaDaftar(berjalan, posisi.id) }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()

  // Validasi ulang (validasi di form bisa dilewati); isi PDF diperiksa lagi oleh backend
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
