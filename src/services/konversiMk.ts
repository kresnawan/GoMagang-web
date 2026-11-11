// Konversi mata kuliah.
// - Katalog (Panitia Magang kelola, semua bisa baca): GET & POST /api/v1/mata-kuliah, DELETE /api/v1/mata-kuliah/{id}.
//   DELETE adalah soft delete: MK hilang dari katalog & tidak bisa dipilih lagi, barisnya tetap ada (deleted_at terisi).
// - Penyetaraan (mahasiswa memilih MK untuk pendaftaran Aktif miliknya):
//   GET & POST /api/v1/pendaftaran/{id}/penyetaraan-mk, DELETE /api/v1/penyetaraan-mk/{id}.

import { api } from './http'

/** Tabel mata_kuliah_konversi */
export type MataKuliahKonversi = {
  /** id_mk_konversi sebagai string (dipakai di form) */
  id: string
  mkAsal: string
  mkKonversi: string
  sks: number
  /** ISO 8601 waktu dihapus (soft delete); null bila masih aktif */
  dihapusPada: string | null
}

/** Tabel penyetaraan_mk (sudah digabung dengan mata kuliahnya) */
export type PenyetaraanMk = {
  id: string
  idPendaftaran: string
  /** MK saat ini; bisa saja sudah dihapus dari katalog setelah dipilih */
  mataKuliah: MataKuliahKonversi
  /** ISO 8601 */
  dibuatPada: string
}

/** Batas panjang nama MK asal & MK konversi (karakter), sama dengan backend */
export const NAMA_MK_MAX = 255
/** Rentang SKS yang diterima backend */
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

const ENDPOINT_MK = '/api/v1/mata-kuliah'

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

/**
 * MK yang aktif, urut nama MK konversi. Dengan `termasukDihapus` (hanya Panitia Magang) yang sudah dihapus ikut dikirim,
 * di bawah yang aktif
 */
export async function getMataKuliahKonversi(signal?: AbortSignal, termasukDihapus = false): Promise<MataKuliahKonversi[]> {
  const params = termasukDihapus ? { termasuk_dihapus: true } : undefined
  const { data } = await api.get<MataKuliahResponse[]>(ENDPOINT_MK, { params, signal })
  return data.map(toMataKuliah)
}

export type MataKuliahInput = Pick<MataKuliahKonversi, 'mkAsal' | 'mkKonversi' | 'sks'>

/** Hanya Panitia Magang. Error 409 (pasangan MK asal & konversi sudah ada) & 422 membawa `message` (lihat pesanError) */
export async function tambahMataKuliah(input: MataKuliahInput, signal?: AbortSignal): Promise<MataKuliahKonversi> {
  const body = { mk_asal: input.mkAsal, mk_konversi: input.mkKonversi, sks: input.sks }
  const { data } = await api.post<MataKuliahResponse>(ENDPOINT_MK, body, { signal })
  return toMataKuliah(data)
}

/**
 * Hanya Panitia Magang. Soft delete: MK hilang dari katalog dan tidak bisa dipilih lagi, tapi penyetaraan yang sudah
 * memilihnya tetap ada. Error 404 bila tidak ada / sudah dihapus
 */
export async function hapusMataKuliah(id: string, signal?: AbortSignal): Promise<MataKuliahKonversi> {
  const { data } = await api.delete<MataKuliahResponse>(`${ENDPOINT_MK}/${id}`, { signal })
  return toMataKuliah(data)
}

/** MK yang dipilih untuk satu pendaftaran, urut waktu dipilih */
export async function getPenyetaraanMk(idPendaftaran: string, signal?: AbortSignal): Promise<PenyetaraanMk[]> {
  const { data } = await api.get<PenyetaraanResponse[]>(`/api/v1/pendaftaran/${idPendaftaran}/penyetaraan-mk`, { signal })
  return data.map(toPenyetaraan)
}

/** Hanya mahasiswa pemilik pendaftaran berstatus Aktif. Error 409 & 422 membawa `message` */
export async function tambahPenyetaraanMk(idPendaftaran: string, idMataKuliah: string, signal?: AbortSignal): Promise<PenyetaraanMk> {
  const body = { id_mk_konversi: Number(idMataKuliah) }
  const { data } = await api.post<PenyetaraanResponse>(`/api/v1/pendaftaran/${idPendaftaran}/penyetaraan-mk`, body, { signal })
  return toPenyetaraan(data)
}

/** Hanya mahasiswa pemilik pendaftaran berstatus Aktif. Error 409 membawa `message`; 404 bila sudah tidak ada */
export async function hapusPenyetaraanMk(idPenyetaraan: string, signal?: AbortSignal): Promise<void> {
  await api.delete(`/api/v1/penyetaraan-mk/${idPenyetaraan}`, { signal })
}
