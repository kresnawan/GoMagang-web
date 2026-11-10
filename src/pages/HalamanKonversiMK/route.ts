import { isAxiosError } from 'axios'
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../services/http'
import {
  getMataKuliahKonversi,
  getPenyetaraanMk,
  hapusPenyetaraanMk,
  tambahPenyetaraanMk,
} from '../../services/konversiMk'
import { getPendaftaranList } from '../../services/pendaftaran'

export const PENDAFTARAN_PARAM = 'pendaftaran'

export async function loader({ request }: LoaderFunctionArgs) {
  const [semua, mataKuliah] = await Promise.all([
    getPendaftaranList(request.signal),
    getMataKuliahKonversi(request.signal),
  ])
  const aktif = semua.filter((item) => item.status === 'Aktif')

  // Pilihan disimpan di URL; jika hanya ada 1 pendaftaran Aktif, langsung terpilih
  const idDipilih = new URL(request.url).searchParams.get(PENDAFTARAN_PARAM)
  const terpilih = aktif.find((item) => item.id === idDipilih) ?? (aktif.length === 1 ? aktif[0] : null)
  const penyetaraan = terpilih ? await getPenyetaraanMk(terpilih.id, request.signal) : []

  return { aktif, terpilih, mataKuliah, penyetaraan }
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'tambah') {
      await tambahPenyetaraanMk(String(formData.get('idPendaftaran')), String(formData.get('idMataKuliah')), request.signal)
    } else if (intent === 'hapus') {
      await hapusPenyetaraanMk(String(formData.get('idPenyetaraan')), request.signal)
    } else {
      return gagal('Aksi tidak dikenal.', 400)
    }
    return { ok: true as const }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      return gagal('Data tidak ditemukan. Muat ulang halaman.', 404)
    }
    return gagal(pesanError(err), 500)
  }
}
