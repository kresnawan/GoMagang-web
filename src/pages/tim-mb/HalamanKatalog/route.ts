import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import {
  getPeriodeList,
  getPerusahaanList,
  getPosisiByPeriode,
  PosisiMagangError,
  tambahPosisiMagang,
} from '../../../services/posisiMagang'
import { periodeDefault } from '../periode'

export const PERIODE_PARAM = 'periode'

export async function loader({ request }: LoaderFunctionArgs) {
  const [periode, perusahaan] = await Promise.all([getPeriodeList(), getPerusahaanList()])

  // Periode dipilih lewat URL (?periode=); default periode yang sedang berjalan
  const idDipilih = new URL(request.url).searchParams.get(PERIODE_PARAM)
  const terpilih = periode.find((item) => item.id === idDipilih) ?? periodeDefault(periode)
  const posisi = terpilih ? await getPosisiByPeriode(terpilih.id) : []

  return { periode, perusahaan, terpilih, posisi }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const get = (key: string) => String(formData.get(key) ?? '').trim()
  const input = {
    posisi: get('posisi'),
    deskripsiPersyaratan: get('deskripsiPersyaratan'),
    kuotaTotal: Number(get('kuotaTotal')),
    idPerusahaan: get('idPerusahaan'),
    idPeriode: get('idPeriode'),
  }

  // Validasi ulang (validasi native browser bisa dilewati)
  if (!input.posisi || !input.deskripsiPersyaratan || !input.idPerusahaan || !input.idPeriode) {
    return data({ ok: false as const, error: 'Semua kolom wajib diisi.' }, { status: 400 })
  }
  if (!Number.isInteger(input.kuotaTotal) || input.kuotaTotal < 1) {
    return data({ ok: false as const, error: 'Kuota harus bilangan bulat minimal 1.' }, { status: 400 })
  }

  try {
    const posisi = await tambahPosisiMagang(input)
    return { ok: true as const, idPeriode: posisi.idPeriode }
  } catch (err) {
    const message = err instanceof PosisiMagangError ? err.message : 'Gagal menambah posisi. Coba lagi.'
    return data({ ok: false as const, error: message }, { status: 500 })
  }
}
