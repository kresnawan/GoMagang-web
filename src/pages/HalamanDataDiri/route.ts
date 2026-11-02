import { data, type ActionFunctionArgs } from 'react-router'
import { getDataDiri, updateDataDiri } from '../../services/dataDiri'
import { parseDataDiriForm, validateDataDiri } from './form'

export async function loader() {
  return getDataDiri()
}

export async function action({ request }: ActionFunctionArgs) {
  const input = parseDataDiriForm(await request.formData())

  const error = validateDataDiri(input)
  if (error) return data({ ok: false as const, error }, { status: 400 })

  try {
    await updateDataDiri(input)
    return { ok: true as const }
  } catch {
    return data({ ok: false as const, error: 'Gagal menyimpan data. Coba lagi.' }, { status: 500 })
  }
}
