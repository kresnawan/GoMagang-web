// Surat keterangan kepesertaan magang. Dibuat & ditandatangani (Ed25519) oleh backend saat pertama
// diunduh dari pendaftaran berstatus Aktif; unduhan berikutnya mendapat file yang sama persis.
// - Unduh: GET /api/v1/pendaftaran/{id}/surat-keterangan (pemilik & Panitia Magang)
// - Verifikasi publik (tanpa login): GET /api/v1/surat-keterangan/verifikasi?kode= (kode dari QR)
//   dan POST /api/v1/surat-keterangan/verifikasi (multipart `berkas`, dicocokkan byte per byte)

import { isAxiosError } from 'axios'
import { bacaErrorBlob, namaDariHeader, simpanBlob } from './berkas'
import { api, authClient } from './http'

/** Isi surat yang tercatat & ditandatangani backend saat diterbitkan */
export type SuratTerverifikasi = {
  nomorSurat: string
  /** YYYY-MM-DD */
  tanggalSurat: string
  nama: string
  nim: string
  programStudi: string
  posisi: string
  perusahaan: string
  alamatPerusahaan: string
  program: string
  /** YYYY-MM-DD */
  tanggalMulai: string
  /** YYYY-MM-DD */
  tanggalSelesai: string
  namaPejabat: string
  nipPejabat: string
  jabatanPejabat: string
}

type SuratResponse = {
  nomor_surat: string
  tanggal_surat: string
  nama: string
  nim: string
  program_studi: string
  posisi: string
  perusahaan: string
  alamat_perusahaan: string
  program: string
  tanggal_mulai: string
  tanggal_selesai: string
  nama_pejabat: string
  nip_pejabat: string
  jabatan_pejabat: string
}

const toSurat = (res: SuratResponse): SuratTerverifikasi => ({
  nomorSurat: res.nomor_surat,
  tanggalSurat: res.tanggal_surat,
  nama: res.nama,
  nim: res.nim,
  programStudi: res.program_studi,
  posisi: res.posisi,
  perusahaan: res.perusahaan,
  alamatPerusahaan: res.alamat_perusahaan,
  program: res.program,
  tanggalMulai: res.tanggal_mulai,
  tanggalSelesai: res.tanggal_selesai,
  namaPejabat: res.nama_pejabat,
  nipPejabat: res.nip_pejabat,
  jabatanPejabat: res.jabatan_pejabat,
})

const ENDPOINT_VERIFIKASI = '/api/v1/surat-keterangan/verifikasi'

/**
 * Unduh (dan terbitkan, bila belum) surat keterangan. Error 409 (status bukan Aktif) membawa
 * `message` yang bisa langsung ditampilkan lewat pesanError; 503 berarti kunci tanda tangan
 * belum dipasang di server
 */
export async function unduhSuratKeterangan(idPendaftaran: string): Promise<void> {
  try {
    const response = await api.get<Blob>(`/api/v1/pendaftaran/${idPendaftaran}/surat-keterangan`, {
      responseType: 'blob',
    })
    simpanBlob(response.data, namaDariHeader(response) ?? 'surat-keterangan-magang.pdf')
  } catch (err) {
    await bacaErrorBlob(err)
    throw err
  }
}

// Verifikasi memakai authClient (tanpa interceptor refresh/redirect): halamannya publik, jadi
// pengunjung yang tidak login tidak boleh dilempar ke halaman login.

/** null bila kode tidak valid, tidak dikenal, atau tanda tangannya tidak cocok (404) */
export async function verifikasiKode(kode: string, signal?: AbortSignal): Promise<SuratTerverifikasi | null> {
  try {
    const { data } = await authClient.get<SuratResponse>(ENDPOINT_VERIFIKASI, { params: { kode }, signal })
    return toSurat(data)
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null
    throw err
  }
}

/** null bila berkas bukan surat asli yang diterbitkan portal ini (404) */
export async function verifikasiBerkas(berkas: File, signal?: AbortSignal): Promise<SuratTerverifikasi | null> {
  const body = new FormData()
  body.set('berkas', berkas)
  try {
    const { data } = await authClient.post<SuratResponse>(ENDPOINT_VERIFIKASI, body, { signal })
    return toSurat(data)
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null
    throw err
  }
}
