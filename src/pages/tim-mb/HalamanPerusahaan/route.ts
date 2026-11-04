import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import { getPerusahaan, NAMA_PERUSAHAAN_MAX, tambahPerusahaan } from '../../../services/perusahaan'

export async function loader({ request }: LoaderFunctionArgs) {
  return getPerusahaan(request.signal)
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const nama = String(formData.get('namaPerusahaan') ?? '').trim()
  if (!nama) return gagal('Nama perusahaan wajib diisi.', 400)
  if ([...nama].length > NAMA_PERUSAHAAN_MAX) {
    return gagal(`Nama perusahaan maksimal ${NAMA_PERUSAHAAN_MAX} karakter.`, 400)
  }

  try {
    await tambahPerusahaan(nama, request.signal)
    return { ok: true as const }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menambah perusahaan. Coba lagi.'), 500)
  }
}
