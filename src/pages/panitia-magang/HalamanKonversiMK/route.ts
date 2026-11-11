import { isAxiosError } from 'axios'
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import {
  getMataKuliahKonversi,
  hapusMataKuliah,
  NAMA_MK_MAX,
  SKS_MAX,
  SKS_MIN,
  tambahMataKuliah,
  type MataKuliahInput,
} from '../../../services/konversiMk'

/** Semua MK, termasuk yang sudah dihapus (ditampilkan di bagian bawah halaman) */
export async function loader({ request }: LoaderFunctionArgs) {
  return getMataKuliahKonversi(request.signal, true)
}

/** Jenis operasi yang dikirim lewat field `intent` */
export const INTENT = { tambah: 'tambah', hapus: 'hapus' } as const

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

/** Isi form tambah MK, atau pesan kesalahannya */
function bacaInput(formData: FormData): MataKuliahInput | { error: string } {
  const mkAsal = String(formData.get('mkAsal') ?? '').trim()
  const mkKonversi = String(formData.get('mkKonversi') ?? '').trim()
  const sks = Number(formData.get('sks'))

  if (!mkAsal) return { error: 'MK asal wajib diisi.' }
  if ([...mkAsal].length > NAMA_MK_MAX) return { error: `MK asal maksimal ${NAMA_MK_MAX} karakter.` }
  if (!mkKonversi) return { error: 'MK konversi wajib diisi.' }
  if ([...mkKonversi].length > NAMA_MK_MAX) return { error: `MK konversi maksimal ${NAMA_MK_MAX} karakter.` }
  if (!Number.isInteger(sks) || sks < SKS_MIN || sks > SKS_MAX) {
    return { error: `SKS harus berupa angka ${SKS_MIN}-${SKS_MAX}.` }
  }
  return { mkAsal, mkKonversi, sks }
}

async function tambah(formData: FormData, signal: AbortSignal) {
  const input = bacaInput(formData)
  if ('error' in input) return gagal(input.error, 400)

  try {
    await tambahMataKuliah(input, signal)
    return { ok: true as const }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menambah mata kuliah. Coba lagi.'), 500)
  }
}

async function hapus(formData: FormData, signal: AbortSignal) {
  const id = String(formData.get('id') ?? '')
  if (!/^[1-9]\d*$/.test(id)) return gagal('Mata kuliah tidak valid.', 400)

  try {
    await hapusMataKuliah(id, signal)
    return { ok: true as const }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      return gagal('Mata kuliah tidak ditemukan atau sudah dihapus. Muat ulang halaman.', 404)
    }
    return gagal(pesanError(err, 'Gagal menghapus mata kuliah. Coba lagi.'), 500)
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  switch (formData.get('intent')) {
    case INTENT.tambah:
      return tambah(formData, request.signal)
    case INTENT.hapus:
      return hapus(formData, request.signal)
    default:
      return gagal('Aksi tidak dikenal.', 400)
  }
}
