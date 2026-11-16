import { api } from './http'

export type StatusPeriode = 'belum_dimulai' | 'berlangsung' | 'selesai'

export type Periode = {
  id: number
  catatan: string | null
  waktuMulai: string
  waktuTutup: string
  status: StatusPeriode
}

export type PeriodeInput = {
  catatan: string | null
  waktuMulai: string
  waktuTutup: string
}

type PeriodeResponse = {
  id_periode: number
  catatan: string | null
  waktu_mulai: string
  waktu_tutup: string
  status: StatusPeriode
}

const ENDPOINT = '/periode'

const toPeriode = (res: PeriodeResponse): Periode => ({
  id: res.id_periode,
  catatan: res.catatan,
  waktuMulai: res.waktu_mulai,
  waktuTutup: res.waktu_tutup,
  status: res.status,
})

export async function getPeriode(signal?: AbortSignal, status?: StatusPeriode): Promise<Periode[]> {
  const { data } = await api.get<PeriodeResponse[]>(ENDPOINT, { params: { status }, signal })
  return data.map(toPeriode)
}

export async function tambahPeriode(input: PeriodeInput, signal?: AbortSignal): Promise<Periode> {
  const { data } = await api.post<PeriodeResponse>(
    ENDPOINT,
    { catatan: input.catatan, waktu_mulai: input.waktuMulai, waktu_tutup: input.waktuTutup },
    { signal },
  )
  return toPeriode(data)
}

export async function mulaiPeriode(id: number, signal?: AbortSignal): Promise<Periode> {
  const { data } = await api.patch<PeriodeResponse>(`${ENDPOINT}/${id}/start`, undefined, { signal })
  return toPeriode(data)
}

export async function tutupPeriode(id: number, signal?: AbortSignal): Promise<Periode> {
  const { data } = await api.patch<PeriodeResponse>(`${ENDPOINT}/${id}/stop`, undefined, { signal })
  return toPeriode(data)
}
