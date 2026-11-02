import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import {
  getMataKuliahKonversi,
  getPenyetaraanMk,
  hapusPenyetaraanMk,
  KonversiMkError,
  tambahPenyetaraanMk,
} from '../../services/konversiMk'
import { getPendaftaranList } from '../../services/pendaftaran'

export const PENDAFTARAN_PARAM = 'pendaftaran'

export async function loader({ request }: LoaderFunctionArgs) {
  const [semua, mataKuliah] = await Promise.all([getPendaftaranList(), getMataKuliahKonversi()])
  const aktif = semua.filter((item) => item.status === 'Aktif')

  // Pilihan disimpan di URL; jika hanya ada 1 pendaftaran Aktif, langsung terpilih
  const idDipilih = new URL(request.url).searchParams.get(PENDAFTARAN_PARAM)
  const terpilih = aktif.find((item) => item.id === idDipilih) ?? (aktif.length === 1 ? aktif[0] : null)
  const penyetaraan = terpilih ? await getPenyetaraanMk(terpilih.id) : []

  return { aktif, terpilih, mataKuliah, penyetaraan }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'tambah') {
      await tambahPenyetaraanMk(String(formData.get('idPendaftaran')), String(formData.get('idMataKuliah')))
    } else if (intent === 'hapus') {
      await hapusPenyetaraanMk(String(formData.get('idPenyetaraan')))
    } else {
      return data({ ok: false as const, error: 'Aksi tidak dikenal.' }, { status: 400 })
    }
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof KonversiMkError ? err.message : 'Terjadi kesalahan. Coba lagi.'
    return data({ ok: false as const, error: message }, { status: 500 })
  }
}
