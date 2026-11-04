import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { getDataDiri, updateDataDiri } from '../../services/dataDiri'
import { pesanError } from '../../services/http'
import { parseDataDiriForm, perubahanDataDiri, validateDataDiri } from './form'

export async function loader({ request }: LoaderFunctionArgs) {
  return getDataDiri(request.signal)
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

export async function action({ request }: ActionFunctionArgs) {
  const values = parseDataDiriForm(await request.formData())

  let awal
  try {
    // Bandingkan dengan data terbaru di server, lalu kirim hanya kolom yang berubah
    awal = await getDataDiri(request.signal)
  } catch (err) {
    return gagal(pesanError(err, 'Gagal memuat data terbaru. Coba lagi.'), 500)
  }

  const error = validateDataDiri(awal, values)
  if (error) return gagal(error, 400)

  const changes = perubahanDataDiri(awal, values)
  if (Object.keys(changes).length === 0) return { ok: true as const, message: 'Tidak ada perubahan.' }

  try {
    await updateDataDiri(changes, request.signal)
    return { ok: true as const, message: 'Data diri tersimpan.' }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menyimpan data. Coba lagi.'), 500)
  }
}
