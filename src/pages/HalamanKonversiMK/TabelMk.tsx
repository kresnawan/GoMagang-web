import { useState } from 'react'
import { useFetcher } from 'react-router'
import { ConfirmDialog } from '../../component'
import type { PenyetaraanMk } from '../../services/konversiMk'
import type { action } from './route'

const th = 'border-b border-brand-300 px-3 py-2.5 text-left font-bold text-brand-700'
const td = 'border-b border-brand-300 px-3 py-2.5 align-top'

export function TabelMk({ penyetaraan }: { penyetaraan: PenyetaraanMk[] }) {
  const fetcher = useFetcher<typeof action>()
  const [hapus, setHapus] = useState<PenyetaraanMk | null>(null)
  const isDeleting = fetcher.state !== 'idle'
  const error = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null
  const totalSks = penyetaraan.reduce((total, item) => total + item.mataKuliah.sks, 0)
  const idDihapus = isDeleting ? fetcher.formData?.get('idPenyetaraan') : null
  const baris = penyetaraan.filter((item) => item.id !== idDihapus)

  return (
    <>
      <div className="overflow-x-auto rounded-sm border border-brand-300">
        <table className="w-full border-collapse">
          <thead className="bg-brand-100">
            <tr>
              <th scope="col" className={`${th} hidden w-12 sm:table-cell`}>No</th>
              <th scope="col" className={`${th} hidden sm:table-cell`}>MK Asal</th>
              <th scope="col" className={th}>MK Konversi</th>
              <th scope="col" className={`${th} w-16 text-center`}>SKS</th>
              <th scope="col" className={`${th} w-24`}><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            {baris.map((item, index) => (
              <tr key={item.id}>
                <td className={`${td} hidden sm:table-cell`}>{index + 1}</td>
                <td className={`${td} hidden sm:table-cell`}>{item.mataKuliah.mkAsal}</td>
                <td className={td}>
                  {item.mataKuliah.mkKonversi}
                  <span className="block text-sm text-brand-500 sm:hidden">Asal: {item.mataKuliah.mkAsal}</span>
                  {item.mataKuliah.dihapusPada && (
                    <span className="block text-sm text-brand-500">Sudah tidak tersedia di katalog</span>
                  )}
                </td>
                <td className={`${td} text-center`}>{item.mataKuliah.sks}</td>
                <td className={`${td} text-right`}>
                  <button
                    type="button"
                    onClick={() => {
                      fetcher.reset()
                      setHapus(item)
                    }}
                    className="cursor-pointer rounded-sm px-2 py-1 font-bold text-red-700 outline-none hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {baris.length === 0 && (
              <tr>
                <td colSpan={5} className={`${td} py-8 text-center text-brand-500`}>
                  Belum ada mata kuliah yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
          {baris.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={5} className="px-3 py-2.5 text-right font-bold text-brand-700">
                  Total SKS: {isDeleting ? '…' : totalSks}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <ConfirmDialog
        open={hapus !== null && !(fetcher.state === 'idle' && fetcher.data?.ok)}
        title="Hapus mata kuliah?"
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, hapus'}
        cancelLabel="Batal"
        loading={isDeleting}
        onCancel={() => setHapus(null)}
        onConfirm={() => hapus && fetcher.submit({ intent: 'hapus', idPenyetaraan: hapus.id }, { method: 'post' })}
      >
        <p>
          <strong>{hapus?.mataKuliah.mkKonversi}</strong> ({hapus?.mataKuliah.sks} SKS) akan dihapus dari daftar konversi.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-red-600">
            {error}
          </p>
        )}
      </ConfirmDialog>
    </>
  )
}
