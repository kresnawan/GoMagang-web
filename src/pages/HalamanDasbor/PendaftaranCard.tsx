import { Link } from 'react-router'
import type { Pendaftaran } from '../../services/pendaftaran'
import { StatusPendaftaran } from './StatusPendaftaran'

const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

function Tanggal({ label, iso }: { label: string; iso: string }) {
  return (
    <div>
      <dt className="inline">{label}: </dt>
      <dd className="inline whitespace-nowrap">
        <time dateTime={iso}>{tanggalFormat.format(new Date(iso))}</time>
      </dd>
    </div>
  )
}

export function PendaftaranCard({ pendaftaran }: { pendaftaran: Pendaftaran }) {
  return (
    <Link
      to={pendaftaran.id}
      className="flex flex-col overflow-hidden rounded-lg border border-brand-300 bg-white outline-none transition-shadow hover:border-brand-500 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-300"
    >
      <header className="truncate border-b border-brand-300 px-4 py-3 font-bold text-brand-700" title={pendaftaran.perusahaan}>
        {pendaftaran.perusahaan}
      </header>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:gap-4">
        <img
          src={pendaftaran.gambar}
          alt={pendaftaran.perusahaan}
          className="aspect-3/1 w-full shrink-0 self-start rounded-sm bg-brand-100 object-cover sm:aspect-4/3 sm:w-28"
        />
        <div className="min-w-0">
          <h2 className="text-h6 leading-snug text-brand-700">{pendaftaran.posisi}</h2>
          <dl className="mt-1 text-sm text-brand-500">
            <Tanggal label="Diajukan" iso={pendaftaran.diajukanPada} />
            <Tanggal label="Terakhir diubah" iso={pendaftaran.diubahPada} />
          </dl>
        </div>
      </div>

      <StatusPendaftaran status={pendaftaran.status} className="border-t border-brand-300" />
    </Link>
  )
}
