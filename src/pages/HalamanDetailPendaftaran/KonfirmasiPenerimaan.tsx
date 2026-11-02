import { useState } from 'react'
import { useFetcher } from 'react-router'
import { Button, ConfirmDialog } from '../../component'
import type { PendaftaranDetail } from '../../services/pendaftaran'
import type { action } from './route'

/** Tombol konfirmasi penerimaan + dialog. Tampil di titik log "Diterima" selama status masih Diterima */
export function KonfirmasiPenerimaan({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  const fetcher = useFetcher<typeof action>()
  const [open, setOpen] = useState(false)
  const isSending = fetcher.state !== 'idle'
  const error = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null

  return (
    <div className="mt-3">
      <p className="mb-3 text-sm text-brand-900">
        Selamat, kamu diterima! Konfirmasi untuk menerima tawaran magang ini.
      </p>
      <Button
        type="button"
        className="px-5 py-2"
        onClick={() => {
          fetcher.reset()
          setOpen(true)
        }}
      >
        Konfirmasi Penerimaan
      </Button>

      {/* Setelah berhasil, loader memuat ulang data → status Aktif → komponen ini hilang beserta dialognya */}
      <ConfirmDialog
        open={open}
        title="Konfirmasi penerimaan?"
        confirmLabel={isSending ? 'Memproses...' : 'Ya, konfirmasi'}
        cancelLabel="Batal"
        loading={isSending}
        onCancel={() => setOpen(false)}
        onConfirm={() => fetcher.submit({ intent: 'konfirmasi' }, { method: 'post' })}
      >
        <p className="mb-3">
          Kamu akan menerima magang sebagai <strong>{pendaftaran.posisi}</strong> di{' '}
          <strong>{pendaftaran.perusahaan}</strong>.
        </p>
        <p>
          <strong>Tindakan ini tidak dapat dibatalkan.</strong> Pendaftaran kamu yang lain akan otomatis berstatus
          Batal/Mengundurkan Diri.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-red-600">
            {error}
          </p>
        )}
      </ConfirmDialog>
    </div>
  )
}
