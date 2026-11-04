import { redirect, type MiddlewareFunction } from 'react-router'
import { getDataDiri, kolomBelumDiisi, type DataDiri } from '../../services/dataDiri'

/**
 * Middleware /pendaftaran/*: mahasiswa wajib melengkapi data diri sebelum mendaftar.
 * Jika ada kolom kosong → tampilkan alert, lalu arahkan ke halaman Data Diri.
 */
export const wajibDataDiriLengkap: MiddlewareFunction = async ({ request }) => {
  let data: DataDiri
  try {
    data = await getDataDiri(request.signal)
  } catch {
    // Gagal memuat (mis. jaringan): jangan blokir halaman, loader halaman akan menampilkan error-nya sendiri
    return
  }

  const kosong = kolomBelumDiisi(data)
  if (kosong.length === 0) return

  window.alert(
    `Lengkapi data diri kamu terlebih dahulu sebelum mendaftar magang.\n\nKolom yang belum diisi: ${kosong.join(', ')}.`,
  )
  throw redirect('/data-diri')
}
