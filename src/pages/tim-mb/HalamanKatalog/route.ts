import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import { getPosisiList, NAMA_POSISI_MAX, tambahPosisi } from '../../../services/lowongan'
import { getPeriode, type Periode } from '../../../services/periode'
import { getPerusahaan } from '../../../services/perusahaan'

export const PERIODE_PARAM = 'periode'

/** Periode yang sedang berjalan; jika tidak ada, yang mulai paling akhir (daftar sudah urut terbaru dulu) */
const periodeDefault = (periode: Periode[]) => periode.find((item) => item.status === 'berlangsung') ?? periode[0] ?? null

export async function loader({ request }: LoaderFunctionArgs) {
  // Perusahaan untuk dropdown dialog tambah
  const [periode, perusahaan] = await Promise.all([getPeriode(request.signal), getPerusahaan(request.signal)])

  // Periode dipilih lewat URL (?periode=); default periode yang sedang berjalan
  const idDipilih = Number(new URL(request.url).searchParams.get(PERIODE_PARAM))
  const terpilih = periode.find((item) => item.id === idDipilih) ?? periodeDefault(periode)
  const posisi = terpilih ? await getPosisiList({ idPeriode: terpilih.id }, request.signal) : []

  return { periode, perusahaan, terpilih, posisi }
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

/** "" atau bukan bilangan bulat positif → NaN */
const toId = (value: string) => (/^[1-9][0-9]*$/.test(value) ? Number(value) : NaN)

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const get = (key: string) => String(formData.get(key) ?? '').trim()
  const input = {
    posisi: get('posisi'),
    deskripsiPersyaratan: get('deskripsiPersyaratan'),
    kuota: Number(get('kuota')),
    idPerusahaan: toId(get('idPerusahaan')),
    idPeriode: toId(get('idPeriode')),
  }

  // Validasi ulang (validasi native browser bisa dilewati); aturan sama dengan backend
  if (!input.posisi || !input.deskripsiPersyaratan || !get('kuota')) return gagal('Semua kolom wajib diisi.', 400)
  if (Number.isNaN(input.idPerusahaan)) return gagal('Pilih perusahaan.', 400)
  if (Number.isNaN(input.idPeriode)) return gagal('Pilih periode.', 400)
  if ([...input.posisi].length > NAMA_POSISI_MAX) return gagal(`Nama posisi maksimal ${NAMA_POSISI_MAX} karakter.`, 400)
  if (!Number.isSafeInteger(input.kuota) || input.kuota < 1) {
    return gagal('Kuota harus bilangan bulat minimal 1.', 400)
  }

  try {
    const posisi = await tambahPosisi(input, request.signal)
    return { ok: true as const, idPeriode: posisi.idPeriode }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menambah posisi. Coba lagi.'), 500)
  }
}
