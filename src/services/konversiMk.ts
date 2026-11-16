import { api } from './http'

export type MataKuliahKonversi = {
  id: string
  mkAsal: string
  mkKonversi: string
  sks: number
  dihapusPada: string | null
}

export type PenyetaraanMk = {
  id: string
  idPendaftaran: string
  mataKuliah: MataKuliahKonversi
  dibuatPada: string
}

export const NAMA_MK_MAX = 255
export const SKS_MIN = 1
export const SKS_MAX = 24

type MataKuliahResponse = {
  id_mk_konversi: number
  mk_asal: string
  mk_konversi: string
  sks: number
  deleted_at: string | null
}

type PenyetaraanResponse = {
  id_penyetaraan: number
  id_pendaftaran: number
  created_at: string
  mata_kuliah: MataKuliahResponse
}

const ENDPOINT_MK = '/mata-kuliah'

const toMataKuliah = (res: MataKuliahResponse): MataKuliahKonversi => ({
  id: String(res.id_mk_konversi),
  mkAsal: res.mk_asal,
  mkKonversi: res.mk_konversi,
  sks: res.sks,
  dihapusPada: res.deleted_at,
})

const toPenyetaraan = (res: PenyetaraanResponse): PenyetaraanMk => ({
  id: String(res.id_penyetaraan),
  idPendaftaran: String(res.id_pendaftaran),
  mataKuliah: toMataKuliah(res.mata_kuliah),
  dibuatPada: res.created_at,
})

export async function getMataKuliahKonversi(signal?: AbortSignal, termasukDihapus = false): Promise<MataKuliahKonversi[]> {
  const params = termasukDihapus ? { termasuk_dihapus: true } : undefined
  const { data } = await api.get<MataKuliahResponse[]>(ENDPOINT_MK, { params, signal })
  return data.map(toMataKuliah)
}

export type MataKuliahInput = Pick<MataKuliahKonversi, 'mkAsal' | 'mkKonversi' | 'sks'>

export async function tambahMataKuliah(input: MataKuliahInput, signal?: AbortSignal): Promise<MataKuliahKonversi> {
  const body = { mk_asal: input.mkAsal, mk_konversi: input.mkKonversi, sks: input.sks }
  const { data } = await api.post<MataKuliahResponse>(ENDPOINT_MK, body, { signal })
  return toMataKuliah(data)
}

export async function hapusMataKuliah(id: string, signal?: AbortSignal): Promise<MataKuliahKonversi> {
  const { data } = await api.delete<MataKuliahResponse>(`${ENDPOINT_MK}/${id}`, { signal })
  return toMataKuliah(data)
}

export async function getPenyetaraanMk(idPendaftaran: string, signal?: AbortSignal): Promise<PenyetaraanMk[]> {
  const { data } = await api.get<PenyetaraanResponse[]>(`/pendaftaran/${idPendaftaran}/penyetaraan-mk`, { signal })
  return data.map(toPenyetaraan)
}

export async function tambahPenyetaraanMk(idPendaftaran: string, idMataKuliah: string, signal?: AbortSignal): Promise<PenyetaraanMk> {
  const body = { id_mk_konversi: Number(idMataKuliah) }
  const { data } = await api.post<PenyetaraanResponse>(`/pendaftaran/${idPendaftaran}/penyetaraan-mk`, body, { signal })
  return toPenyetaraan(data)
}

export async function hapusPenyetaraanMk(idPenyetaraan: string, signal?: AbortSignal): Promise<void> {
  await api.delete(`/penyetaraan-mk/${idPenyetaraan}`, { signal })
}
