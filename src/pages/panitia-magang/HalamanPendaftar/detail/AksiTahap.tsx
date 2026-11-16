import { useState, type ReactNode } from 'react'
import { Button } from '../../../../component'
import type { JadwalSeleksiSubstansi, PlottingDpm } from '../../../../services/pendaftaran'
import type { PendaftarDetail } from '../../../../services/pendaftar'
import { JadwalSeleksiDialog } from '../JadwalSeleksiDialog'
import { PlottingDpmDialog } from '../PlottingDpmDialog'

type PendaftarProps = Pick<PendaftarDetail, 'id' | 'nama' | 'nim'>

function TombolDialog({ label, dialog }: { label: string; dialog: (onClose: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" variant="outlined" className="mt-2 px-3 py-1.5 text-sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && dialog(() => setOpen(false))}
    </>
  )
}

export function AksiJadwalSeleksi({ pendaftar, jadwal }: { pendaftar: PendaftarProps; jadwal: JadwalSeleksiSubstansi | null }) {
  return (
    <TombolDialog
      label={jadwal ? 'Ubah jadwal seleksi substansi' : 'Tambahkan jadwal seleksi substansi'}
      dialog={(onClose) => <JadwalSeleksiDialog pendaftar={[pendaftar]} jadwalAwal={jadwal} onClose={onClose} />}
    />
  )
}

export function AksiPlottingDpm({ pendaftar, plotting }: { pendaftar: PendaftarProps; plotting: PlottingDpm | null }) {
  return (
    <TombolDialog
      label={plotting ? 'Ubah plotting DPM' : 'Unggah plotting DPM'}
      dialog={(onClose) => <PlottingDpmDialog pendaftar={[pendaftar]} plottingAwal={plotting} onClose={onClose} />}
    />
  )
}
