import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import { getPeriode, tambahPeriode } from '../../../services/periode'
import { CATATAN_MAX, wibKeIso } from '../periode'

export async function loader({ request }: LoaderFunctionArgs) {
  return getPeriode(request.signal)
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const catatan = String(formData.get('catatan') ?? '').trim() || null
  const waktuMulai = wibKeIso(formData.get('waktuMulai'))
  const waktuTutup = wibKeIso(formData.get('waktuTutup'))

  if (!waktuMulai || !waktuTutup) return gagal('Waktu mulai dan waktu tutup wajib diisi.', 400)
  if (!(Date.parse(waktuTutup) > Date.parse(waktuMulai))) return gagal('Waktu tutup harus setelah waktu mulai.', 400)
  if (catatan && catatan.length > CATATAN_MAX) return gagal(`Catatan maksimal ${CATATAN_MAX} karakter.`, 400)

  try {
    await tambahPeriode({ catatan, waktuMulai, waktuTutup }, request.signal)
    return { ok: true as const }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menambah periode. Coba lagi.'), 500)
  }
}
