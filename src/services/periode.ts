// Periode pendaftaran: GET & POST /api/v1/periode.
// Catatan: dropdown periode di Pendaftar masih memakai mock di services/posisiMagang.ts
// sampai data pendaftar Tim MB ikut disambungkan ke backend.

import { api } from './http'

/** Status dihitung backend dari jam WIB saat ini */
export type StatusPeriode = 'belum_dimulai' | 'berlangsung' | 'selesai'

export type Periode = {
  id: number
  catatan: string | null
  /** ISO 8601 (WIB) */
  waktuMulai: string
  /** ISO 8601 (WIB) */
  waktuTutup: string
  status: StatusPeriode
}

export type PeriodeInput = {
  catatan: string | null
  /** ISO 8601 dengan zona waktu */
  waktuMulai: string
  /** ISO 8601 dengan zona waktu */
  waktuTutup: string
}

/** Bentuk satu item response GET/POST /api/v1/periode */
type PeriodeResponse = {
  id_periode: number
  catatan: string | null
  waktu_mulai: string
  waktu_tutup: string
  status: StatusPeriode
}

const ENDPOINT = '/api/v1/periode'

const toPeriode = (res: PeriodeResponse): Periode => ({
  id: res.id_periode,
  catatan: res.catatan,
  waktuMulai: res.waktu_mulai,
  waktuTutup: res.waktu_tutup,
  status: res.status,
})

/**
 * Daftar periode, dari yang mulai paling akhir. Tanpa status: Tim MB mendapat semua periode,
 * mahasiswa hanya yang berlangsung. Mahasiswa hanya boleh memakai status 'berlangsung' (lainnya 403)
 */
export async function getPeriode(signal?: AbortSignal, status?: StatusPeriode): Promise<Periode[]> {
  const { data } = await api.get<PeriodeResponse[]>(ENDPOINT, { params: { status }, signal })
  return data.map(toPeriode)
}

/** Error 409 (beririsan) & 422 membawa `message` yang bisa langsung ditampilkan (lihat pesanError) */
export async function tambahPeriode(input: PeriodeInput, signal?: AbortSignal): Promise<Periode> {
  const { data } = await api.post<PeriodeResponse>(
    ENDPOINT,
    { catatan: input.catatan, waktu_mulai: input.waktuMulai, waktu_tutup: input.waktuTutup },
    { signal },
  )
  return toPeriode(data)
}
