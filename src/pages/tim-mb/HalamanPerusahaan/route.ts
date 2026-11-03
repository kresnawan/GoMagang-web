import { data, type ActionFunctionArgs } from 'react-router'
import { getPerusahaanRingkasan, PosisiMagangError, tambahPerusahaan } from '../../../services/posisiMagang'

export async function loader() {
  return getPerusahaanRingkasan()
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const nama = String(formData.get('namaPerusahaan') ?? '').trim()
  if (!nama) return data({ ok: false as const, error: 'Nama perusahaan wajib diisi.' }, { status: 400 })

  try {
    await tambahPerusahaan(nama)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof PosisiMagangError ? err.message : 'Gagal menambah perusahaan. Coba lagi.'
    return data({ ok: false as const, error: message }, { status: 500 })
  }
}
