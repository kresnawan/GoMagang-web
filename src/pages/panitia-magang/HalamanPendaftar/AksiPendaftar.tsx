import { useState } from 'react'
import { Button } from '../../../component'
import type { PendaftarRingkas } from '../../../services/pendaftar'
import type { StatusPendaftaran } from '../../../services/pendaftaran'
import { EksporPendaftar } from './EksporPendaftar'
import { JadwalSeleksiDialog } from './JadwalSeleksiDialog'
import { PlottingDpmDialog } from './PlottingDpmDialog'

/** Aturan tiap aksi massal: status yang wajib dimiliki semua terpilih, dan penanda data yang sudah ada */
const AKSI = {
  jadwal: {
    label: 'Tambah Jadwal Seleksi Substansi',
    status: 'Lolos Seleksi Administrasi',
    sudahAda: (item: PendaftarRingkas) => item.adaJadwalSeleksi,
    pesanSudahAda: (n: number) => `${n} pendaftar terpilih sudah punya jadwal seleksi substansi. Ubah jadwalnya lewat Detail.`,
  },
  plotting: {
    label: 'Tambah Plotting DPM',
    status: 'Aktif',
    sudahAda: (item: PendaftarRingkas) => item.adaPlottingDpm,
    pesanSudahAda: (n: number) => `${n} pendaftar terpilih sudah punya plotting DPM. Ubah plotting-nya lewat Detail.`,
  },
} satisfies Record<
  string,
  {
    label: string
    status: StatusPendaftaran
    sudahAda: (item: PendaftarRingkas) => boolean
    pesanSudahAda: (n: number) => string
  }
>

type Aksi = keyof typeof AKSI

/**
 * Aksi massal hanya untuk pendaftar dengan status yang sesuai dan belum punya datanya (data yang sudah ada
 * diubah satu per satu lewat dialog Detail). null bila boleh
 */
function alasanNonaktif(aksi: Aksi, terpilih: PendaftarRingkas[]): string | null {
  const aturan = AKSI[aksi]
  if (terpilih.length === 0) return 'Pilih pendaftar terlebih dahulu.'
  if (!terpilih.every((item) => item.status === aturan.status)) {
    return `Semua pendaftar terpilih harus berstatus ${aturan.status}.`
  }
  const sudahAda = terpilih.filter(aturan.sudahAda).length
  return sudahAda > 0 ? aturan.pesanSudahAda(sudahAda) : null
}

type AksiPendaftarProps = {
  terpilih: PendaftarRingkas[]
  /** Dipanggil setelah aksi massal tersimpan (mis. untuk mengosongkan pilihan) */
  onSelesai: () => void
}

/** Ekspor & tombol aksi massal untuk pendaftar terpilih; masing-masing aktif hanya bila syaratnya terpenuhi */
export function AksiPendaftar({ terpilih, onSelesai }: AksiPendaftarProps) {
  const [aktif, setAktif] = useState<Aksi | null>(null)
  const alasan = { jadwal: alasanNonaktif('jadwal', terpilih), plotting: alasanNonaktif('plotting', terpilih) }
  const tutup = () => setAktif(null)

  // Keterangan hanya ditampilkan bila ada yang dipilih dan tidak ada aksi yang bisa dipakai
  const keterangan =
    terpilih.length === 0
      ? 'Pilih pendaftar terlebih dahulu.'
      : alasan.jadwal && alasan.plotting
        ? `Jadwal seleksi: ${alasan.jadwal} Plotting DPM: ${alasan.plotting}`
        : null

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <EksporPendaftar idPendaftar={terpilih.map((item) => item.id)} />
        {(Object.keys(AKSI) as Aksi[]).map((aksi) => (
          <Button
            key={aksi}
            type="button"
            className="px-4 py-2 text-sm"
            disabled={alasan[aksi] !== null}
            title={alasan[aksi] ?? undefined}
            aria-describedby={alasan[aksi] && keterangan ? 'aksi-pendaftar-info' : undefined}
            onClick={() => setAktif(aksi)}
          >
            {AKSI[aksi].label}
          </Button>
        ))}
      </div>
      {keterangan && (
        <p id="aksi-pendaftar-info" className="text-right text-sm text-brand-500">
          {keterangan}
        </p>
      )}

      {aktif === 'jadwal' && <JadwalSeleksiDialog pendaftar={terpilih} onClose={tutup} onSuccess={onSelesai} />}
      {aktif === 'plotting' && <PlottingDpmDialog pendaftar={terpilih} onClose={tutup} onSuccess={onSelesai} />}
    </div>
  )
}
