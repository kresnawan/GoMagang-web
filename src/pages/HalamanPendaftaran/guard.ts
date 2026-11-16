import { redirect, type MiddlewareFunction } from 'react-router'
import { getDataDiri, kolomBelumDiisi, type DataDiri } from '../../services/dataDiri'

export const wajibDataDiriLengkap: MiddlewareFunction = async ({ request }) => {
  let data: DataDiri
  try {
    data = await getDataDiri(request.signal)
  } catch {
    return
  }

  const kosong = kolomBelumDiisi(data)
  if (kosong.length === 0) return

  window.alert(
    `Lengkapi data diri kamu terlebih dahulu sebelum mendaftar magang.\n\nKolom yang belum diisi: ${kosong.join(', ')}.`,
  )
  throw redirect('/data-diri')
}
