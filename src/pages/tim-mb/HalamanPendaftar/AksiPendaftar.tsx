import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { Button, FormDialog, FormField, TextInput } from '../../../component'
import type { StatusPendaftaran } from '../../../services/pendaftaran'
import type { PendaftarRingkas } from '../../../services/pendaftar'
import { MAX_FILE_SIZE } from '../../../services/lowongan'
import { INTENT, type action } from './route'

type Intent = (typeof INTENT)[keyof typeof INTENT]

/** Aturan tiap aksi: semua data terpilih wajib berstatus ini */
const SYARAT: Record<Intent, { label: string; status: StatusPendaftaran }> = {
  jadwal: { label: 'Tambah Jadwal Seleksi Substansi', status: 'Lolos Seleksi Administrasi' },
  surat: { label: 'Tambah Surat Keterangan Magang', status: 'Aktif' },
  plotting: { label: 'Tambah Plotting DPM', status: 'Aktif' },
}

type DialogProps = {
  terpilih: PendaftarRingkas[]
  onClose: () => void
  onSuccess: () => void
}

/** Kirim aksi + ids terpilih; panggil onSuccess setelah tersimpan */
function useAksi(intent: Intent, terpilih: PendaftarRingkas[], onSuccess: () => void) {
  const fetcher = useFetcher<typeof action>()
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onSuccess()
  }, [result, onSuccess])

  function submit(formData: FormData) {
    formData.set('intent', intent)
    for (const item of terpilih) formData.append('ids', item.id)
    fetcher.submit(formData, { method: 'post', encType: 'multipart/form-data' })
  }

  return {
    submit,
    isSaving: fetcher.state !== 'idle',
    error: result && !result.ok ? result.error : null,
  }
}

function PesanError({ message }: { message: string | null }) {
  return message ? (
    <p role="alert" className="text-red-600">
      {message}
    </p>
  ) : null
}

function Ringkasan({ jumlah, catatan }: { jumlah: number; catatan: string }) {
  return (
    <p className="text-sm text-brand-700">
      Berlaku untuk <strong>{jumlah} pendaftar</strong> terpilih. {catatan}
    </p>
  )
}

function JadwalDialog({ terpilih, onClose, onSuccess }: DialogProps) {
  const { submit, isSaving, error } = useAksi(INTENT.jadwal, terpilih, onSuccess)
  return (
    <FormDialog open title={SYARAT.jadwal.label} submitLabel={isSaving ? 'Menyimpan...' : 'Simpan'} loading={isSaving} onCancel={onClose} onSubmit={submit}>
      <Ringkasan jumlah={terpilih.length} catatan="Jadwal yang sudah ada akan diganti." />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tanggal" htmlFor="jadwal-tanggal">
          <TextInput id="jadwal-tanggal" name="tanggal" type="date" required />
        </FormField>
        <FormField label="Jam" htmlFor="jadwal-jam">
          <TextInput id="jadwal-jam" name="jam" type="time" required />
        </FormField>
      </div>
      <FormField label="Lokasi" htmlFor="jadwal-lokasi">
        <TextInput id="jadwal-lokasi" name="lokasi" required maxLength={255} placeholder="mis. Gedung F, Ruang F2.3 atau Daring (Zoom)" />
      </FormField>
      <PesanError message={error} />
    </FormDialog>
  )
}

function PlottingDialog({ terpilih, onClose, onSuccess }: DialogProps) {
  const { submit, isSaving, error } = useAksi(INTENT.plotting, terpilih, onSuccess)
  return (
    <FormDialog open title={SYARAT.plotting.label} submitLabel={isSaving ? 'Menyimpan...' : 'Simpan'} loading={isSaving} onCancel={onClose} onSubmit={submit}>
      <Ringkasan jumlah={terpilih.length} catatan="Plotting yang sudah ada akan diganti." />
      <FormField label="Nama Dosen Pembimbing Magang" htmlFor="dpm-nama">
        <TextInput id="dpm-nama" name="namaDpm" required maxLength={255} />
      </FormField>
      <FormField label="Kontak DPM" htmlFor="dpm-kontak">
        <TextInput id="dpm-kontak" name="kontakDpm" required maxLength={255} placeholder="Email atau nomor HP" />
      </FormField>
      <PesanError message={error} />
    </FormDialog>
  )
}

function SuratDialog({ terpilih, onClose, onSuccess }: DialogProps) {
  const { submit, isSaving, error } = useAksi(INTENT.surat, terpilih, onSuccess)
  return (
    <FormDialog open title={SYARAT.surat.label} submitLabel={isSaving ? 'Mengunggah...' : 'Unggah'} loading={isSaving} onCancel={onClose} onSubmit={submit}>
      <Ringkasan jumlah={terpilih.length} catatan={`Unggah 1 file PDF (maks. ${MAX_FILE_SIZE / 1024 / 1024} MB) untuk setiap pendaftar.`} />
      <ul className="max-h-80 overflow-y-auto rounded-sm border border-brand-300">
        {terpilih.map((item) => (
          <li key={item.id} className="border-b border-brand-300 px-3 py-3 last:border-b-0">
            <label htmlFor={`surat-${item.id}`} className="mb-1.5 block">
              <span className="font-bold text-brand-900">{item.nama}</span>{' '}
              <span className="text-sm text-brand-500">{item.nim}</span>
            </label>
            {/* Input file ringkas: FileInput kotak besar terlalu tinggi untuk banyak pendaftar */}
            <input
              id={`surat-${item.id}`}
              name={`surat-${item.id}`}
              type="file"
              accept=".pdf,application/pdf"
              required
              className="block w-full cursor-pointer text-sm text-brand-900 file:mr-3 file:cursor-pointer file:rounded-sm file:border file:border-brand-700 file:bg-white file:px-3 file:py-1.5 file:font-bold file:text-brand-700 hover:file:bg-brand-100"
            />
          </li>
        ))}
      </ul>
      <PesanError message={error} />
    </FormDialog>
  )
}

const DIALOG = { jadwal: JadwalDialog, surat: SuratDialog, plotting: PlottingDialog }

/** Tiga tombol aksi massal; masing-masing aktif hanya jika semua data terpilih memenuhi syarat status */
export function AksiPendaftar({ terpilih, onSelesai }: { terpilih: PendaftarRingkas[]; onSelesai: () => void }) {
  const [aktif, setAktif] = useState<Intent | null>(null)
  const ActiveDialog = aktif ? DIALOG[aktif] : null

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SYARAT) as Intent[]).map((intent) => {
          const { label, status } = SYARAT[intent]
          const boleh = terpilih.length > 0 && terpilih.every((item) => item.status === status)
          return (
            <Button
              key={intent}
              type="button"
              className="px-4 py-2 text-sm"
              disabled={!boleh}
              title={boleh ? undefined : `Pilih pendaftar yang semuanya berstatus ${status}`}
              onClick={() => setAktif(intent)}
            >
              {label}
            </Button>
          )
        })}
      </div>

      {ActiveDialog && (
        <ActiveDialog
          terpilih={terpilih}
          onClose={() => setAktif(null)}
          onSuccess={() => {
            setAktif(null)
            onSelesai()
          }}
        />
      )}
    </>
  )
}
