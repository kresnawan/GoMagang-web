import { useEffect, useState, type ReactNode } from 'react'
import { useFetcher } from 'react-router'
import { Button, ConfirmDialog, Dialog } from '../../../../component'
import { cn } from '../../../../component/cn'
import { pesanError } from '../../../../services/http'
import type { LogStatus, StatusPendaftaran } from '../../../../services/pendaftaran'
import { unduhBerkas } from '../../../../services/berkas'
import { TRANSISI_PANITIA_MAGANG, type BerkasPendaftar, type PendaftarDetail } from '../../../../services/pendaftar'
import type { Periode } from '../../../../services/periode'
import { formatTanggal, formatTanggalJadwal, formatUkuran, formatWaktu } from '../../../HalamanDetailPendaftaran/format'
import { labelPeriode } from '../../periode'
import { AksiJadwalSeleksi, AksiPlottingDpm } from './AksiTahap'
import { detailPendaftarPath, type action, type loader } from './route'

export type DetailPendaftarDialogProps = {
  idPendaftar: number
  periode: Periode[]
  onClose: () => void
}

export function DetailPendaftarDialog({ idPendaftar, periode, onClose }: DetailPendaftarDialogProps) {
  const fetcher = useFetcher<typeof loader>()
  const { load } = fetcher

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
          ['Email', detail.email ?? '-'],
          ['Jenis Kelamin', detail.jenisKelamin ?? '-'],
          ['Program Studi', detail.programStudi ?? '-'],
          ['IPK', detail.ipk?.toFixed(2) ?? '-'],
          ['Semester', detail.semester ?? '-'],
          ['Nomor HP', detail.nomorHp ?? '-'],
        ]}
      />
    </Section>
  )
}

function DataPendaftaran({ detail, periode }: { detail: PendaftarDetail; periode: Periode[] }) {
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
          <ItemBerkas key={berkas.id} berkas={berkas} />
        ))}
        {detail.berkas.length === 0 && <li className="text-brand-500">Tidak ada berkas.</li>}
      </ul>
    </Section>
  )
}

function ItemBerkas({ berkas }: { berkas: BerkasPendaftar }) {
  const [mengunduh, setMengunduh] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUnduh() {
    setMengunduh(true)
    setError(null)
    try {
      await unduhBerkas(berkas)
    } catch (err) {
      setError(pesanError(err, 'Gagal mengunduh berkas. Coba lagi.'))
    } finally {
      setMengunduh(false)
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div className="min-w-0 flex-1 basis-40">
        <p className="text-brand-500">{berkas.jenis}</p>
        <p className="break-all text-brand-900">
          {berkas.nama} <span className="text-brand-500">({formatUkuran(berkas.ukuran)})</span>
        </p>
      </div>
      <Button
        type="button"
        variant="outlined"
        className="px-3 py-1.5 text-sm"
        onClick={handleUnduh}
        disabled={mengunduh}
        aria-label={`Unduh ${berkas.jenis}`}
      >
        {mengunduh ? 'Mengunduh…' : 'Unduh'}
      </Button>
      {error && (
        <p role="alert" className="w-full text-red-600">
          {error}
        </p>
      )}
    </li>
  )
}

function RiwayatStatus({ detail }: { detail: PendaftarDetail }) {
  const log = [...detail.log].reverse()
  const pilihan = TRANSISI_PANITIA_MAGANG[detail.status]
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
  titik?: ReactNode
  garisAtas?: boolean
  garisBawah?: boolean
  children: ReactNode
}

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
  const statusSaatIni = log.statusBaru === detail.status

  if (log.statusBaru === 'Lolos Seleksi Administrasi') {
    const jadwal = detail.jadwalSeleksi
    return (
      <InfoBlok judul="Jadwal Seleksi Substansi" className="mt-2">
        {jadwal ? (
          <>
            <p>
              {formatTanggalJadwal(jadwal.tanggal)}, pukul {jadwal.jam.replace(':', '.')}
            </p>
            <p>{jadwal.lokasi}</p>
          </>
        ) : (
          <BelumAda>Jadwal seleksi substansi belum ditambahkan.</BelumAda>
        )}
        {statusSaatIni && <AksiJadwalSeleksi pendaftar={detail} jadwal={jadwal} />}
      </InfoBlok>
    )
  }

  if (log.statusBaru === 'Aktif') {
    const { plottingDpm } = detail
    return (
      <InfoBlok judul="Plotting DPM" className="mt-2">
        {plottingDpm ? (
          <p>
            {plottingDpm.nama} <span className="text-brand-500">· {plottingDpm.kontak}</span>
          </p>
        ) : (
          <BelumAda>Plotting DPM belum ditambahkan.</BelumAda>
        )}
        {statusSaatIni && <AksiPlottingDpm pendaftar={detail} plotting={plottingDpm} />}
      </InfoBlok>
    )
  }

  return null
}

function InfoBlok({ judul, className, children }: { judul: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('text-sm', className)}>
      <p className="font-bold text-brand-700">{judul}</p>
      {children}
    </div>
  )
}

function BelumAda({ children }: { children: ReactNode }) {
  return <p className="text-brand-500 italic">{children}</p>
}

function StatusBerikutnya({ detail, pilihan }: { detail: PendaftarDetail; pilihan: StatusPendaftaran[] }) {
  const [target, setTarget] = useState<StatusPendaftaran | null>(null)

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
              onClick={() => setTarget(status)}
            >
              {status}
            </Button>
          )
        })}
      </div>

      {target && <KonfirmasiUbahStatus key={target} detail={detail} target={target} onClose={() => setTarget(null)} />}
    </>
  )
}

function KonfirmasiUbahStatus({
  detail,
  target,
  onClose,
}: {
  detail: PendaftarDetail
  target: StatusPendaftaran
  onClose: () => void
}) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onClose()
  }, [result, onClose])

  return (
    <ConfirmDialog
      open
      title={`Ubah status menjadi ${target}?`}
      confirmLabel={isSaving ? 'Menyimpan...' : 'Ya, simpan'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onConfirm={() => fetcher.submit({ statusBaru: target }, { method: 'post', action: detailPendaftarPath(detail.id) })}
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
  )
}
