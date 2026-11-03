import { useSearchParams } from 'react-router'
import { Button, DropDown } from '../../../component'
import { PARAM, ROWS_OPTIONS } from './params'

type PaginationProps = {
  total: number
  rows: number
  halaman: number
}

/** Dropdown jumlah baris + navigasi halaman, disimpan di URL */
export function Pagination({ total, rows, halaman }: PaginationProps) {
  const [, setSearchParams] = useSearchParams()
  const jumlahHalaman = Math.max(1, Math.ceil(total / rows))
  const awal = total === 0 ? 0 : (halaman - 1) * rows + 1
  const akhir = Math.min(halaman * rows, total)

  function setParam(updates: Record<string, string | null>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      return next
    })
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm text-brand-700">
        Rows
        <DropDown
          value={rows}
          onChange={(event) => setParam({ [PARAM.rows]: event.target.value, [PARAM.halaman]: null })}
          className="w-24 py-1 pr-8"
        >
          {ROWS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </DropDown>
      </label>

      <div className="flex items-center gap-3">
        <span className="text-sm text-brand-700">
          {awal}–{akhir} dari {total}
        </span>
        <Button
          type="button"
          variant="outlined"
          className="px-3 py-1"
          aria-label="Halaman sebelumnya"
          disabled={halaman <= 1}
          onClick={() => setParam({ [PARAM.halaman]: String(halaman - 1) })}
        >
          ‹
        </Button>
        <Button
          type="button"
          variant="outlined"
          className="px-3 py-1"
          aria-label="Halaman berikutnya"
          disabled={halaman >= jumlahHalaman}
          onClick={() => setParam({ [PARAM.halaman]: String(halaman + 1) })}
        >
          ›
        </Button>
      </div>
    </div>
  )
}
