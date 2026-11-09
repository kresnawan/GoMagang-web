import { isAxiosError } from 'axios'
import { data, type ActionFunctionArgs, type LoaderFunctionArgs, type ShouldRevalidateFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import {
  getHalamanPendaftar,
  simpanJadwalSeleksi,
  simpanPlottingDpm,
  validasiJadwalSeleksi,
  validasiPlottingDpm,
  type JadwalSeleksiInput,
  type PlottingDpmInput,
} from '../../../services/pendaftar'
import { getPosisiList } from '../../../services/lowongan'
import { getPeriode } from '../../../services/periode'
import { getPerusahaan } from '../../../services/perusahaan'
import { parsePendaftarParams } from './params'

/** Alamat action halaman ini (route index), untuk fetcher.submit dari dialog Detail */
export const PENDAFTAR_ACTION = '/tim-mb/pendaftar?index'

export const INTENT = { jadwal: 'jadwal', plotting: 'plotting' } as const

/** id route induk `pendaftar` (dipakai useRouteLoaderData) */
export const REFERENSI_ROUTE_ID = 'tim-mb-pendaftar'

/**
 * Loader route induk: data referensi untuk dropdown filter & dialog Detail (periode, perusahaan, posisi).
 * Dipisah dari loader daftar supaya tidak ikut dimuat ulang setiap pencarian/filter/halaman berubah.
 * GET /api/v1/posisi hanya mengirim satu periode, jadi posisi diambil per periode secara paralel
 */
export async function referensiLoader({ request }: LoaderFunctionArgs) {
  const [periode, perusahaan] = await Promise.all([getPeriode(request.signal), getPerusahaan(request.signal)])
  const posisiPerPeriode = await Promise.all(
    periode.map((item) => getPosisiList({ idPeriode: item.id }, request.signal)),
  )
  return { periode, perusahaan, posisi: posisiPerPeriode.flat() }
}

/**
 * Periode & perusahaan tidak berubah oleh apa pun di halaman ini (cari, filter, pindah halaman, ubah status,
 * simpan jadwal), jadi tidak dimuat ulang. Pengecualian: revalidasi manual tanpa pindah URL, mis. tombol
 * "Coba lagi" saat gagal memuat. Saat masuk lagi dari menu lain, loader tetap dijalankan (route baru dipasang)
 */
export function shouldRevalidateReferensi({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return !formMethod && currentUrl.href === nextUrl.href ? defaultShouldRevalidate : false
}

/** Loader daftar: hanya pendaftar. Query URL halaman = query backend; pencarian, filter, & pagination di backend */
export async function loader({ request }: LoaderFunctionArgs) {
  const query = parsePendaftarParams(new URL(request.url).searchParams)
  const hasil = await getHalamanPendaftar(query, request.signal)
  return { rows: query.r, halaman: query.p, ...hasil }
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

/** Id pendaftar dari field `ids` (boleh berulang); null bila ada yang bukan bilangan bulat positif */
function parseIds(formData: FormData): number[] | null {
  const ids = formData.getAll('ids').map((value) => Number(value))
  return ids.every((id) => Number.isSafeInteger(id) && id > 0) ? [...new Set(ids)] : null
}

async function jadwal(formData: FormData, signal: AbortSignal) {
  const idPendaftar = parseIds(formData)
  if (!idPendaftar) return gagal('Pendaftar tidak valid.', 400)

  const input: JadwalSeleksiInput = {
    idPendaftar,
    tanggal: String(formData.get('tanggal') ?? ''),
    jam: String(formData.get('jam') ?? ''),
    lokasi: String(formData.get('lokasi') ?? ''),
  }
  const error = validasiJadwalSeleksi(input)
  if (error) return gagal(error, 400)

  try {
    await simpanJadwalSeleksi(input, signal)
    return { ok: true as const }
  } catch (err) {
    const status = isAxiosError(err) ? (err.response?.status ?? 500) : 500
    if (status === 404) {
      return gagal('Ada pendaftar yang tidak ditemukan. Muat ulang halaman lalu coba lagi.', 404)
    }
    return gagal(pesanError(err, 'Gagal menyimpan jadwal seleksi substansi. Coba lagi.'), status)
  }
}

async function plotting(formData: FormData, signal: AbortSignal) {
  const idPendaftar = parseIds(formData)
  if (!idPendaftar) return gagal('Pendaftar tidak valid.', 400)

  const input: PlottingDpmInput = {
    idPendaftar,
    namaDpm: String(formData.get('nama_dpm') ?? ''),
    kontakDpm: String(formData.get('kontak_dpm') ?? ''),
  }
  const error = validasiPlottingDpm(input)
  if (error) return gagal(error, 400)

  try {
    await simpanPlottingDpm(input, signal)
    return { ok: true as const }
  } catch (err) {
    const status = isAxiosError(err) ? (err.response?.status ?? 500) : 500
    if (status === 404) {
      return gagal('Ada pendaftar yang tidak ditemukan. Muat ulang halaman lalu coba lagi.', 404)
    }
    return gagal(pesanError(err, 'Gagal menyimpan plotting DPM. Coba lagi.'), status)
  }
}

/** Setelah berhasil, daftar & dialog Detail yang terbuka dimuat ulang otomatis (revalidasi) */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  switch (formData.get('intent')) {
    case INTENT.jadwal:
      return jadwal(formData, request.signal)
    case INTENT.plotting:
      return plotting(formData, request.signal)
    default:
      return gagal('Aksi tidak dikenal.', 400)
  }
}
