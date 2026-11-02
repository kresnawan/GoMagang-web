import { getPendaftaranList, isPendaftaranBerjalan } from '../../services/pendaftaran'

/** Dasbor hanya menampilkan pendaftaran yang masih berjalan (maksimal 2) */
export async function loader() {
  const pendaftaran = await getPendaftaranList()
  return pendaftaran
}
