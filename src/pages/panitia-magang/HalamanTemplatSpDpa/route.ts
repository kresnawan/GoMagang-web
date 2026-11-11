import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import { getTemplatSpDpa, isTautanValid, simpanTemplatSpDpa, TAUTAN_TEMPLAT_MAX } from '../../../services/templatSpDpa'

export async function loader({ request }: LoaderFunctionArgs) {
  return getTemplatSpDpa(request.signal)
}

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const tautan = String(formData.get('tautan') ?? '').trim()

  if (!tautan) return gagal('Tautan templat wajib diisi.', 400)
  if ([...tautan].length > TAUTAN_TEMPLAT_MAX) return gagal(`Tautan templat maksimal ${TAUTAN_TEMPLAT_MAX} karakter.`, 400)
  if (!isTautanValid(tautan)) return gagal('Tautan harus berupa URL lengkap yang diawali http:// atau https://.', 400)

  try {
    await simpanTemplatSpDpa(tautan, request.signal)
    return { ok: true as const }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menyimpan tautan templat. Coba lagi.'), 500)
  }
}
