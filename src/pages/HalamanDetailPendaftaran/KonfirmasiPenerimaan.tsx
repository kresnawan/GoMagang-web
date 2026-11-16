import { useState } from 'react'
import { useFetcher } from 'react-router'
import { Button, ConfirmDialog } from '../../component'
import type { PendaftaranDetail } from '../../services/pendaftaran'
import { INTENT_KONFIRMASI, type action } from './route'

export function KonfirmasiPenerimaan({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3">
      <p className="mb-3 text-sm text-brand-900">Selamat, kamu diterima! Konfirmasi untuk menerima tawaran magang ini.</p>
      <Button type="button" className="px-5 py-2" onClick={() => setOpen(true)}>
        Konfirmasi Penerimaan
      </Button>
      {open && <KonfirmasiDialog pendaftaran={pendaftaran} onClose={() => setOpen(false)} />}
    </div>
  )
}

function KonfirmasiDialog({ pendaftaran, onClose }: { pendaftaran: PendaftaranDetail; onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  const isSending = fetcher.state !== 'idle'
  const error = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null

  return (
    <ConfirmDialog
      open
      title="Konfirmasi penerimaan?"
      confirmLabel={isSending ? 'Memproses...' : 'Ya, konfirmasi'}
      cancelLabel="Batal"
      loading={isSending}
      onCancel={onClose}
      onConfirm={() => fetcher.submit({ intent: INTENT_KONFIRMASI }, { method: 'post' })}
    >
      <p className="mb-3">
        Kamu akan menerima magang sebagai <strong>{pendaftaran.posisi}</strong> di <strong>{pendaftaran.perusahaan}</strong>.
      </p>
      <p>
        <strong>Tindakan ini tidak dapat dibatalkan.</strong> Pendaftaran kamu yang lain yang masih berjalan akan otomatis
        berstatus Batal/Mengundurkan Diri.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-red-600">
          {error}
        </p>
      )}
    </ConfirmDialog>
  )
}
