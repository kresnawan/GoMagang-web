import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import {
  getPendaftarList,
  PendaftarError,
  simpanJadwalSeleksi,
  simpanPlottingDpm,
  simpanSuratKeterangan,
} from '../../../services/pendaftar'
import { MAX_FILE_SIZE } from '../../../services/lowongan'
import { getPeriodeList } from '../../../services/posisiMagang'
import { parsePendaftarParams } from './params'

export async function loader({ request }: LoaderFunctionArgs) {
  const { filter, rows, halaman } = parsePendaftarParams(new URL(request.url).searchParams)
  const [periode, hasil] = await Promise.all([getPeriodeList(), getPendaftarList(filter, halaman, rows)])
  return { periode, rows, halaman, ...hasil }
}

export const INTENT = { jadwal: 'jadwal', plotting: 'plotting', surat: 'surat' } as const

const gagal = (error: string, status = 400) => data({ ok: false as const, error }, { status })

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const get = (key: string) => String(formData.get(key) ?? '').trim()
  const ids = formData.getAll('ids').map(String)

  try {
    switch (formData.get('intent')) {
      case INTENT.jadwal: {
        const jadwal = { tanggal: get('tanggal'), jam: get('jam'), lokasi: get('lokasi') }
        if (!jadwal.tanggal || !jadwal.jam || !jadwal.lokasi) return gagal('Tanggal, jam, dan lokasi wajib diisi.')
        await simpanJadwalSeleksi(ids, jadwal)
        break
      }
      case INTENT.plotting: {
        const plotting = { nama: get('namaDpm'), kontak: get('kontakDpm') }
        if (!plotting.nama || !plotting.kontak) return gagal('Nama dan kontak DPM wajib diisi.')
        await simpanPlottingDpm(ids, plotting)
        break
      }
      case INTENT.surat: {
        const berkas = ids.map((id) => ({ id, file: formData.get(`surat-${id}`) }))
        for (const { file } of berkas) {
          if (!(file instanceof File) || file.size === 0) return gagal('Setiap pendaftar wajib diberi file surat.')
          if (!file.name.toLowerCase().endsWith('.pdf')) return gagal(`${file.name} harus berformat PDF.`)
          if (file.size > MAX_FILE_SIZE) return gagal(`${file.name} melebihi ${MAX_FILE_SIZE / 1024 / 1024} MB.`)
        }
        await simpanSuratKeterangan(berkas as Array<{ id: string; file: File }>)
        break
      }
      default:
        return gagal('Aksi tidak dikenal.')
    }
    return { ok: true as const }
  } catch (err) {
    return gagal(err instanceof PendaftarError ? err.message : 'Gagal menyimpan. Coba lagi.', 500)
  }
}
