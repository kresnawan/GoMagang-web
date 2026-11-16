import { isAxiosError } from 'axios'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../services/http'
import { MAX_FILE_SIZE } from '../../services/lowongan'
import { verifikasiBerkas, verifikasiKode, type SuratTerverifikasi } from '../../services/suratKeterangan'

export type HasilVerifikasi =
  | { status: 'asli'; surat: SuratTerverifikasi }
  | { status: 'tidak-dikenal' }
  | { status: 'gagal'; pesan: string }

function gagal(err: unknown): HasilVerifikasi {
  const pesan =
    isAxiosError(err) && err.response?.status === 503
      ? 'Layanan verifikasi sedang tidak tersedia. Coba lagi nanti.'
      : pesanError(err, 'Gagal memeriksa surat. Coba lagi.')
  return { status: 'gagal', pesan }
}

const hasil = (surat: SuratTerverifikasi | null): HasilVerifikasi =>
  surat ? { status: 'asli', surat } : { status: 'tidak-dikenal' }

export async function loader({ request }: LoaderFunctionArgs) {
  const kode = new URL(request.url).searchParams.get('kode')?.trim() || null
  if (!kode) return { kode, hasil: null }
  try {
    return { kode, hasil: hasil(await verifikasiKode(kode, request.signal)) }
  } catch (err) {
    return { kode, hasil: gagal(err) }
  }
}

export async function action({ request }: ActionFunctionArgs): Promise<HasilVerifikasi> {
  const berkas = (await request.formData()).get('berkas')
  if (!(berkas instanceof File) || berkas.size === 0) {
    return { status: 'gagal', pesan: 'Pilih berkas PDF surat keterangan.' }
  }
  if (berkas.size > MAX_FILE_SIZE) {
    return { status: 'gagal', pesan: 'Berkas terlalu besar untuk sebuah surat keterangan.' }
  }
  try {
    return hasil(await verifikasiBerkas(berkas, request.signal))
  } catch (err) {
    return gagal(err)
  }
}
