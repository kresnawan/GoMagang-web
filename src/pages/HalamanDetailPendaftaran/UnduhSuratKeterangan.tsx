import { useState } from 'react'
import { useRevalidator } from 'react-router'
import { Button } from '../../component'
import { isAxiosError } from 'axios'
import { pesanError } from '../../services/http'
import type { PendaftaranDetail } from '../../services/pendaftaran'
import { unduhSuratKeterangan } from '../../services/suratKeterangan'

function pesanGagal(err: unknown) {
  if (isAxiosError(err) && err.response?.status === 503) {
    return 'Surat keterangan belum bisa diunduh saat ini. Coba lagi nanti.'
  }
  return pesanError(err, 'Gagal mengunduh surat keterangan. Coba lagi.')
}

export function UnduhSuratKeterangan({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  const [mengunduh, setMengunduh] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { revalidate } = useRevalidator()
  const surat = pendaftaran.suratKeterangan

  if (!surat && pendaftaran.status !== 'Aktif') return null

  async function handleUnduh() {
    setMengunduh(true)
    setError(null)
    try {
      await unduhSuratKeterangan(pendaftaran.id)
      if (!surat) await revalidate()
    } catch (err) {
      setError(pesanGagal(err))
    } finally {
      setMengunduh(false)
    }
  }

  return (
    <div>
      <p className="mb-1.5 font-bold text-brand-700">Surat Keterangan Kepesertaan Magang</p>
      {surat && <p className="mb-2 break-all text-brand-500">Nomor: {surat.nomorSurat}</p>}
      <Button type="button" className="px-4 py-2 text-sm" onClick={handleUnduh} disabled={mengunduh}>
        {mengunduh ? 'Mengunduh…' : 'Unduh surat keterangan magang'}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
