import type { ReactNode } from 'react'
import { cn } from '../../component/cn'
import type { LogStatus, PendaftaranDetail } from '../../services/pendaftaran'
import { formatTanggalJadwal, formatWaktu } from './format'
import { KonfirmasiPenerimaan } from './KonfirmasiPenerimaan'
import { UnduhSuratKeterangan } from './UnduhSuratKeterangan'

export function RiwayatStatus({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  const log = [...pendaftaran.log].reverse()

  return (
    <section aria-label="Riwayat status" className="rounded-sm border border-brand-300 p-5 sm:p-6">
      <ol>
        {log.map((item, index) => (
          <LogItem
            key={item.id}
            log={item}
            pendaftaran={pendaftaran}
            isLatest={index === 0}
            isLast={index === log.length - 1}
          />
        ))}
      </ol>
    </section>
  )
}

type LogItemProps = {
  log: LogStatus
  pendaftaran: PendaftaranDetail
  isLatest: boolean
  isLast: boolean
}

function LogItem({ log, pendaftaran, isLatest, isLast }: LogItemProps) {
  return (
    <li className={cn('relative pl-8', !isLast && 'pb-7')}>
      {!isLast && <span aria-hidden className="absolute -bottom-9 left-1.75 top-9 w-0.5 bg-brand-300" />}
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-9 size-4 rounded-full border-2 border-brand-500 bg-white',
          isLatest && 'bg-brand-500 shadow-[inset_0_0_0_2px_white]',
        )}
      />

      <time dateTime={log.dibuatPada} className="mb-1 block text-sm text-brand-500">
        {formatWaktu(log.dibuatPada)}
      </time>
      <div className="rounded-sm border border-brand-300 px-3 py-2">
        <p className="font-bold text-brand-900">{log.statusBaru}</p>
        <LogInfo log={log} pendaftaran={pendaftaran} />
      </div>
    </li>
  )
}

function LogInfo({ log, pendaftaran }: { log: LogStatus; pendaftaran: PendaftaranDetail }) {
  if (log.statusBaru === 'Lolos Seleksi Administrasi') {
    const jadwal = pendaftaran.jadwalSeleksi
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
      </InfoBlok>
    )
  }

  if (log.statusBaru === 'Diterima' && pendaftaran.status === 'Diterima') {
    return <KonfirmasiPenerimaan pendaftaran={pendaftaran} />
  }

  if (log.statusBaru === 'Aktif') {
    const { plottingDpm } = pendaftaran
    return (
      <div className="mt-3 flex flex-col gap-4">
        <InfoBlok judul="Plotting DPM">
          {plottingDpm ? (
            <>
              <p>{plottingDpm.nama}</p>
              <p className="break-all text-brand-500">{plottingDpm.kontak}</p>
            </>
          ) : (
            <BelumAda>Plotting DPM belum ditambahkan.</BelumAda>
          )}
        </InfoBlok>
        <div className="text-sm text-brand-900">
          <UnduhSuratKeterangan pendaftaran={pendaftaran} />
        </div>
      </div>
    )
  }

  return null
}

function InfoBlok({ judul, className, children }: { judul: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('text-sm text-brand-900', className)}>
      <p className="mb-1 font-bold text-brand-700">{judul}</p>
      {children}
    </div>
  )
}

function BelumAda({ children }: { children: ReactNode }) {
  return <p className="text-brand-500 italic">{children}</p>
}
