import { useEffect, useState, type ReactNode } from 'react'
import { useFetcher } from 'react-router'
import { Button, ConfirmDialog, Dialog } from '../../../../component'
import { cn } from '../../../../component/cn'
import type { LogStatus, StatusPendaftaran } from '../../../../services/pendaftaran'
import { TRANSISI_TIM_MB, type PendaftarDetail } from '../../../../services/pendaftar'
import type { PeriodePendaftaran } from '../../../../services/posisiMagang'
import { formatTanggal, formatTanggalJadwal, formatUkuran, formatWaktu } from '../../../HalamanDetailPendaftaran/format'
import { labelPeriode } from '../../periode'
import { detailPendaftarPath, type action, type loader } from './route'

export type DetailPendaftarDialogProps = {
  idPendaftar: string
  periode: PeriodePendaftaran[]
  onClose: () => void
}

/** Dialog detail pendaftar: data diri, pendaftaran, berkas, dan riwayat status (dengan tombol ubah status) */
export function DetailPendaftarDialog({ idPendaftar, periode, onClose }: DetailPendaftarDialogProps) {
  const fetcher = useFetcher<typeof loader>()
  const { load } = fetcher

  // Data dimuat saat dialog dibuka; otomatis dimuat ulang setelah status diubah (revalidasi)
  useEffect(() => {
    load(detailPendaftarPath(idPendaftar))
  }, [idPendaftar, load])

  const detail = fetcher.data

  return (
    <Dialog open title="Detail Pendaftar" onClose={onClose} className="max-w-4xl">
      {detail ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <DataDiri detail={detail} />
            <DataPendaftaran detail={detail} periode={periode} />
            <Berkas detail={detail} />
          </div>
          <RiwayatStatus detail={detail} />
        </div>
      ) : (
        <div className="grid animate-pulse gap-6 md:grid-cols-2" aria-busy aria-label="Memuat detail">
          <div className="h-80 rounded-sm bg-brand-100" />
          <div className="h-80 rounded-sm bg-brand-100" />
        </div>
      )}
    </Dialog>
  )
}

// ---- Section kiri ----

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-base font-bold text-brand-700">{title}</h3>
      {children}
    </section>
  )
}

function Rincian({ items }: { items: Array<[label: string, value: ReactNode]> }) {
  return (
    <dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-1.5 rounded-sm border border-brand-300 p-3 text-sm">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-brand-500">{label}</dt>
          <dd className="min-w-0 wrap-break-word text-brand-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function DataDiri({ detail }: { detail: PendaftarDetail }) {
  return (
    <Section title="Data Diri">
      <Rincian
        items={[
          ['Nama Lengkap', detail.nama],
          ['NIM', detail.nim],
          ['Email', detail.email],
          ['Jenis Kelamin', detail.jenisKelamin],
          ['Program Studi', detail.programStudi],
          ['IPK', detail.ipk.toFixed(2)],
          ['Nomor HP', detail.nomorHp],
        ]}
      />
    </Section>
  )
}

function DataPendaftaran({ detail, periode }: { detail: PendaftarDetail; periode: PeriodePendaftaran[] }) {
  const periodeItem = periode.find((item) => item.id === detail.idPeriode)
  return (
    <Section title="Pendaftaran">
      <Rincian
        items={[
          ['Posisi', detail.posisi],
          ['Perusahaan', detail.perusahaan],
          ['Periode', periodeItem ? labelPeriode(periodeItem) : '-'],
          ['Diajukan', formatTanggal(detail.diajukanPada)],
        ]}
      />
    </Section>
  )
}

function Berkas({ detail }: { detail: PendaftarDetail }) {
  return (
    <Section title="Berkas yang Diunggah">
      <ul className="flex flex-col gap-2 rounded-sm border border-brand-300 p-3 text-sm">
        {detail.berkas.map((berkas) => (
          <li key={berkas.jenis}>
            <p className="text-brand-500">{berkas.jenis}</p>
            <p className="break-all text-brand-900">
              {berkas.nama} <span className="text-brand-500">({formatUkuran(berkas.ukuran)})</span>
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// ---- Section kanan: riwayat status ----

/**
 * Timeline vertikal: pilihan "Status berikutnya?" di paling atas, lalu status saat ini,
 * lalu status-status sebelumnya ke bawah (paling lama di paling bawah).
 */
function RiwayatStatus({ detail }: { detail: PendaftarDetail }) {
  const log = [...detail.log].reverse()
  const pilihan = TRANSISI_TIM_MB[detail.status]
  const menungguMahasiswa = detail.status === 'Diterima'
  const adaBerikutnya = pilihan.length > 0 || menungguMahasiswa

  return (
    <Section title="Riwayat Status">
      <ol className="rounded-sm border border-brand-300 px-4 py-2">
        {adaBerikutnya && (
          <BarisTimeline garisBawah>
            {menungguMahasiswa ? (
              <>
                <p className="mb-1 text-sm font-bold text-brand-700">Status berikutnya?</p>
                <p className="text-sm text-brand-500">Menunggu konfirmasi penerimaan dari mahasiswa (menjadi Aktif).</p>
              </>
            ) : (
              <StatusBerikutnya key={detail.status} detail={detail} pilihan={pilihan} />
            )}
          </BarisTimeline>
        )}

        {log.map((item, index) => {
          const saatIni = index === 0
          return (
            <BarisTimeline
              key={item.id}
              garisAtas={!saatIni || adaBerikutnya}
              garisBawah={index < log.length - 1}
              titik={
                <span
                  className={cn(
                    'shrink-0 rounded-full border-2 border-brand-500 bg-white',
                    saatIni ? 'size-5 bg-brand-500 shadow-[inset_0_0_0_3px_white]' : 'size-4',
                  )}
                />
              }
            >
              <div className={cn('rounded-sm border px-4 py-3', saatIni ? 'border-brand-500 bg-brand-50' : 'border-brand-300')}>
                {saatIni && <p className="text-sm text-brand-500">Status saat ini</p>}
                <p className={cn('font-bold text-brand-900', saatIni && 'text-h6')}>{item.statusBaru}</p>
                <time dateTime={item.dibuatPada} className="block text-sm text-brand-500">
                  {formatWaktu(item.dibuatPada)}
                </time>
                <InfoLog log={item} detail={detail} />
                {saatIni && !adaBerikutnya && (
                  <p className="mt-2 text-sm text-brand-500">Status akhir — tidak dapat diubah lagi.</p>
                )}
              </div>
            </BarisTimeline>
          )
        })}
      </ol>
    </Section>
  )
}

type BarisTimelineProps = {
  /** Titik di kolom kiri; kosong untuk baris "Status berikutnya?" */
  titik?: ReactNode
  garisAtas?: boolean
  garisBawah?: boolean
  children: ReactNode
}

/** Satu baris timeline: kolom kiri berisi garis + titik (di tengah vertikal), kolom kanan isi */
function BarisTimeline({ titik, garisAtas = false, garisBawah = false, children }: BarisTimelineProps) {
  return (
    <li className="grid grid-cols-[1.25rem_1fr] gap-x-4">
      <div aria-hidden className="flex flex-col items-center">
        <span className={cn('w-0.5 flex-1', garisAtas && 'bg-brand-500')} />
        {titik}
        <span className={cn('w-0.5 flex-1', garisBawah && 'bg-brand-500')} />
      </div>
      <div className="min-w-0 py-2.5">{children}</div>
    </li>
  )
}

function InfoLog({ log, detail }: { log: LogStatus; detail: PendaftarDetail }) {
  if (log.statusBaru === 'Lolos Seleksi Administrasi' && detail.jadwalSeleksi) {
    const jadwal = detail.jadwalSeleksi
    return (
      <div className="mt-2 text-sm">
        <p className="font-bold text-brand-700">Jadwal Seleksi Substansi</p>
        <p>
          {formatTanggalJadwal(jadwal.tanggal)}, pukul {jadwal.jam.replace(':', '.')}
        </p>
        <p>{jadwal.lokasi}</p>
      </div>
    )
  }

  if (log.statusBaru === 'Aktif') {
    return (
      <div className="mt-2 flex flex-col gap-2 text-sm">
        <div>
          <p className="font-bold text-brand-700">Surat Keterangan Kepesertaan Magang</p>
          <p className={detail.suratKeterangan ? 'break-all' : 'text-brand-500'}>
            {detail.suratKeterangan
              ? `${detail.suratKeterangan.nama} (${formatUkuran(detail.suratKeterangan.ukuran)})`
              : 'Belum diunggah.'}
          </p>
        </div>
        <div>
          <p className="font-bold text-brand-700">Dosen Pembimbing Magang</p>
          {detail.plottingDpm ? (
            <p>
              {detail.plottingDpm.nama} <span className="text-brand-500">· {detail.plottingDpm.kontak}</span>
            </p>
          ) : (
            <p className="text-brand-500">Belum ditentukan.</p>
          )}
        </div>
      </div>
    )
  }

  return null
}

/**
 * Pilihan "Status berikutnya?" (transisi yang boleh dilakukan Tim MB), dengan konfirmasi.
 * Diberi key status saat ini, sehingga setelah tersimpan pilihan & dialog mulai dari awal.
 */
function StatusBerikutnya({ detail, pilihan }: { detail: PendaftarDetail; pilihan: StatusPendaftaran[] }) {
  const fetcher = useFetcher<typeof action>()
  const [target, setTarget] = useState<StatusPendaftaran | null>(null)
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  return (
    <>
      <p className="mb-2 text-sm font-bold text-brand-700">Status berikutnya?</p>
      <div className={cn('grid gap-2', pilihan.length > 1 && 'sm:grid-cols-2')}>
        {pilihan.map((status) => {
          const negatif = status === 'Tidak Lolos'
          return (
            <Button
              key={status}
              type="button"
              variant={negatif ? 'outlined' : 'fill'}
              className={cn('px-3 py-2.5 text-sm', negatif && 'border-red-700 text-red-700 hover:bg-red-50')}
              onClick={() => {
                fetcher.reset()
                setTarget(status)
              }}
            >
              {status}
            </Button>
          )
        })}
      </div>

      <ConfirmDialog
        open={target !== null && !result?.ok}
        title={`Ubah status menjadi ${target}?`}
        confirmLabel={isSaving ? 'Menyimpan...' : 'Ya, simpan'}
        cancelLabel="Batal"
        loading={isSaving}
        onCancel={() => setTarget(null)}
        onConfirm={() =>
          target && fetcher.submit({ statusBaru: target }, { method: 'post', action: detailPendaftarPath(detail.id) })
        }
      >
        <p className="mb-2">
          Status <strong>{detail.nama}</strong> ({detail.nim}) akan diubah dari <strong>{detail.status}</strong> menjadi{' '}
          <strong>{target}</strong>.
        </p>
        <p>Perubahan ini tidak dapat dibatalkan dan langsung terlihat oleh mahasiswa.</p>
        {result && !result.ok && (
          <p role="alert" className="mt-3 text-red-600">
            {result.error}
          </p>
        )}
      </ConfirmDialog>
    </>
  )
}
