import { isAxiosError } from 'axios'
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import {
  getPerusahaan,
  NAMA_PERUSAHAAN_MAX,
  sembunyikanPerusahaan,
  tambahPerusahaan,
  ubahNamaPerusahaan,
} from '../../../services/perusahaan'

export async function loader({ request }: LoaderFunctionArgs) {
  return getPerusahaan(request.signal, true)
}

export const INTENT = { tambah: 'tambah', ubahNama: 'ubah-nama', sembunyikan: 'sembunyikan' } as const

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

function bacaNama(formData: FormData): { nama: string } | { error: string } {
  const nama = String(formData.get('namaPerusahaan') ?? '').trim()
  if (!nama) return { error: 'Nama perusahaan wajib diisi.' }
  if ([...nama].length > NAMA_PERUSAHAAN_MAX) return { error: `Nama perusahaan maksimal ${NAMA_PERUSAHAAN_MAX} karakter.` }
  return { nama }
}

function bacaId(formData: FormData): number | null {
  const id = Number(formData.get('id'))
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

async function tambah(formData: FormData, signal: AbortSignal) {
  const hasil = bacaNama(formData)
  if ('error' in hasil) return gagal(hasil.error, 400)

  try {
    await tambahPerusahaan(hasil.nama, signal)
    return { ok: true as const }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menambah perusahaan. Coba lagi.'), 500)
  }
}

async function ubahNama(formData: FormData, signal: AbortSignal) {
  const id = bacaId(formData)
  if (!id) return gagal('Perusahaan tidak valid.', 400)
  const hasil = bacaNama(formData)
  if ('error' in hasil) return gagal(hasil.error, 400)

  try {
    await ubahNamaPerusahaan(id, hasil.nama, signal)
    return { ok: true as const }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      return gagal('Perusahaan tidak ditemukan atau sudah disembunyikan. Muat ulang halaman.', 404)
    }
    return gagal(pesanError(err, 'Gagal mengubah nama perusahaan. Coba lagi.'), 500)
  }
}

async function sembunyikan(formData: FormData, signal: AbortSignal) {
  const id = bacaId(formData)
  if (!id) return gagal('Perusahaan tidak valid.', 400)

  try {
    await sembunyikanPerusahaan(id, signal)
    return { ok: true as const }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      return gagal('Perusahaan tidak ditemukan atau sudah disembunyikan. Muat ulang halaman.', 404)
    }
    return gagal(pesanError(err, 'Gagal menyembunyikan perusahaan. Coba lagi.'), 500)
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  switch (formData.get('intent')) {
    case INTENT.tambah:
      return tambah(formData, request.signal)
    case INTENT.ubahNama:
      return ubahNama(formData, request.signal)
    case INTENT.sembunyikan:
      return sembunyikan(formData, request.signal)
    default:
      return gagal('Aksi tidak dikenal.', 400)
  }
}
