import { buttonClass } from '../../component'
import { cn } from '../../component/cn'
import type { LogStatus, PendaftaranDetail } from '../../services/pendaftaran'
import { formatTanggalJadwal, formatUkuran, formatWaktu } from './format'
import { KonfirmasiPenerimaan } from './KonfirmasiPenerimaan'

/** Section kanan: riwayat status. Urut bawah ke atas — paling lama di bawah, terbaru di atas */
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
      {/* Garis penghubung ke titik di bawahnya */}
      {!isLast && <span aria-hidden className="absolute -bottom-9 left-1.75 top-9 w-0.5 bg-brand-300" />}
      {/* Titik bergaya RadioButton guideline: terisi untuk status terbaru */}
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

/** Info tambahan di titik log tertentu */
function LogInfo({ log, pendaftaran }: { log: LogStatus; pendaftaran: PendaftaranDetail }) {
  if (log.statusBaru === 'Lolos Seleksi Administrasi' && pendaftaran.jadwalSeleksi) {
    const jadwal = pendaftaran.jadwalSeleksi
    return (
      <div className="mt-2 text-sm text-brand-900">
        <p className="font-bold text-brand-700">Jadwal Seleksi Substansi</p>
        <p>
          {formatTanggalJadwal(jadwal.tanggal)}, pukul {jadwal.jam.replace(':', '.')}
        </p>
        <p>{jadwal.lokasi}</p>
      </div>
    )
  }

  if (log.statusBaru === 'Diterima' && pendaftaran.status === 'Diterima') {
    return <KonfirmasiPenerimaan pendaftaran={pendaftaran} />
  }

  if (log.statusBaru === 'Aktif') {
    const { suratKeterangan, plottingDpm } = pendaftaran
    return (
      <div className="mt-3 flex flex-col gap-4 text-sm text-brand-900">
        <div>
          <p className="mb-1.5 font-bold text-brand-700">Surat Keterangan Kepesertaan Magang</p>
          {suratKeterangan ? (
            <a href={suratKeterangan.url} download={suratKeterangan.nama} className={buttonClass('outlined', 'px-5 py-2')}>
              Unduh Surat (PDF, {formatUkuran(suratKeterangan.ukuran)})
            </a>
          ) : (
            <p className="text-brand-500">Belum tersedia.</p>
          )}
        </div>
        <div>
          <p className="mb-1 font-bold text-brand-700">Dosen Pembimbing Magang</p>
          {plottingDpm ? (
            <>
              <p>{plottingDpm.nama}</p>
              <p className="break-all text-brand-500">{plottingDpm.kontak}</p>
            </>
          ) : (
            <p className="text-brand-500">Belum ditentukan.</p>
          )}
        </div>
      </div>
    )
  }

  return null
}
