import { isAxiosError } from 'axios'
import { bacaErrorBlob, namaDariHeader, simpanBlob } from './berkas'
import { api, publicApi } from './http'

export type SuratTerverifikasi = {
  nomorSurat: string
  tanggalSurat: string
  nama: string
  nim: string
  programStudi: string
  posisi: string
  perusahaan: string
  alamatPerusahaan: string
  program: string
  tanggalMulai: string
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

const ENDPOINT_VERIFIKASI = '/surat-keterangan/verifikasi'

export async function unduhSuratKeterangan(idPendaftaran: string): Promise<void> {
  try {
    const response = await api.get<Blob>(`/pendaftaran/${idPendaftaran}/surat-keterangan`, {
      responseType: 'blob',
    })
    simpanBlob(response.data, namaDariHeader(response) ?? 'surat-keterangan-magang.pdf')
  } catch (err) {
    await bacaErrorBlob(err)
    throw err
  }
}

export async function verifikasiKode(kode: string, signal?: AbortSignal): Promise<SuratTerverifikasi | null> {
  try {
    const { data } = await publicApi.get<SuratResponse>(ENDPOINT_VERIFIKASI, { params: { kode }, signal })
    return toSurat(data)
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null
    throw err
  }
}

export async function verifikasiBerkas(berkas: File, signal?: AbortSignal): Promise<SuratTerverifikasi | null> {
  const body = new FormData()
  body.set('berkas', berkas)
  try {
    const { data } = await publicApi.post<SuratResponse>(ENDPOINT_VERIFIKASI, body, { signal })
    return toSurat(data)
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null
    throw err
  }
}
