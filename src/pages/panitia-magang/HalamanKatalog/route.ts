import { isAxiosError } from 'axios'
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import { getPosisiList, NAMA_POSISI_MAX, sembunyikanPosisi, tambahPosisi, ubahPosisi } from '../../../services/lowongan'
import { getPeriode, type Periode } from '../../../services/periode'
import { getPerusahaan } from '../../../services/perusahaan'

export const PERIODE_PARAM = 'periode'

export const INTENT = { tambah: 'tambah', ubah: 'ubah', sembunyikan: 'sembunyikan' } as const

const periodeDefault = (periode: Periode[]) => periode.find((item) => item.status === 'berlangsung') ?? periode[0] ?? null

export async function loader({ request }: LoaderFunctionArgs) {
  const [periode, perusahaan] = await Promise.all([getPeriode(request.signal), getPerusahaan(request.signal)])

  const idDipilih = Number(new URL(request.url).searchParams.get(PERIODE_PARAM))
  const terpilih = periode.find((item) => item.id === idDipilih) ?? periodeDefault(periode)
  const posisi = terpilih ? await getPosisiList({ idPeriode: terpilih.id, termasukDisembunyikan: true }, request.signal) : []

  return { periode, perusahaan, terpilih, posisi }
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

const toId = (value: string) => (/^[1-9][0-9]*$/.test(value) ? Number(value) : NaN)

const POSISI_TIDAK_ADA = 'Posisi tidak ditemukan atau sudah disembunyikan. Muat ulang halaman.'

function bacaIsi(formData: FormData) {
  const get = (key: string) => String(formData.get(key) ?? '').trim()
  const isi = { posisi: get('posisi'), deskripsiPersyaratan: get('deskripsiPersyaratan'), kuota: Number(get('kuota')) }

  if (!isi.posisi || !isi.deskripsiPersyaratan || !get('kuota')) return { error: 'Semua kolom wajib diisi.' }
  if ([...isi.posisi].length > NAMA_POSISI_MAX) return { error: `Nama posisi maksimal ${NAMA_POSISI_MAX} karakter.` }
  if (!Number.isSafeInteger(isi.kuota) || isi.kuota < 1) return { error: 'Kuota harus bilangan bulat minimal 1.' }
  return { isi }
}

async function tambah(formData: FormData, signal: AbortSignal) {
  const hasil = bacaIsi(formData)
  if (hasil.error) return gagal(hasil.error, 400)
  const idPerusahaan = toId(String(formData.get('idPerusahaan') ?? ''))
  const idPeriode = toId(String(formData.get('idPeriode') ?? ''))
  if (Number.isNaN(idPerusahaan)) return gagal('Pilih perusahaan.', 400)
  if (Number.isNaN(idPeriode)) return gagal('Pilih periode.', 400)

  try {
    const posisi = await tambahPosisi({ ...hasil.isi!, idPerusahaan, idPeriode }, signal)
    return { ok: true as const, idPeriode: posisi.idPeriode }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menambah posisi. Coba lagi.'), 500)
  }
}

async function ubah(formData: FormData, signal: AbortSignal) {
  const id = toId(String(formData.get('id') ?? ''))
  if (Number.isNaN(id)) return gagal('Posisi tidak valid.', 400)
  const hasil = bacaIsi(formData)
  if (hasil.error) return gagal(hasil.error, 400)

  try {
    const posisi = await ubahPosisi(id, hasil.isi!, signal)
    return { ok: true as const, idPeriode: posisi.idPeriode }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return gagal(POSISI_TIDAK_ADA, 404)
    return gagal(pesanError(err, 'Gagal mengubah posisi. Coba lagi.'), 500)
  }
}

async function sembunyikan(formData: FormData, signal: AbortSignal) {
  const id = toId(String(formData.get('id') ?? ''))
  if (Number.isNaN(id)) return gagal('Posisi tidak valid.', 400)

  try {
    const posisi = await sembunyikanPosisi(id, signal)
    return { ok: true as const, idPeriode: posisi.idPeriode }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return gagal(POSISI_TIDAK_ADA, 404)
    return gagal(pesanError(err, 'Gagal menyembunyikan posisi. Coba lagi.'), 500)
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  switch (formData.get('intent')) {
    case INTENT.tambah:
      return tambah(formData, request.signal)
    case INTENT.ubah:
      return ubah(formData, request.signal)
    case INTENT.sembunyikan:
      return sembunyikan(formData, request.signal)
    default:
      return gagal('Aksi tidak dikenal.', 400)
  }
}
