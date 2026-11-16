import { api } from './http'

export type TemplatSpDpa = {
  id: number
  tautan: string
  diubahPada: string
}

export const TAUTAN_TEMPLAT_MAX = 255

type TemplatResponse = {
  id_templat: number
  tautan_templat: string
  updated_at: string
}

const ENDPOINT = '/templat-sp-dpa'

const toTemplat = (res: TemplatResponse): TemplatSpDpa => ({
  id: res.id_templat,
  tautan: res.tautan_templat,
  diubahPada: res.updated_at,
})

export function isTautanValid(tautan: string) {
  try {
    const url = new URL(tautan)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== '' && !/\s/.test(tautan)
  } catch {
    return false
  }
}

export async function getTemplatSpDpa(signal?: AbortSignal): Promise<TemplatSpDpa | null> {
  const { data } = await api.get<TemplatResponse | null>(ENDPOINT, { signal })
  return data ? toTemplat(data) : null
}

export async function simpanTemplatSpDpa(tautan: string, signal?: AbortSignal): Promise<TemplatSpDpa> {
  const { data } = await api.put<TemplatResponse>(ENDPOINT, { tautan_templat: tautan }, { signal })
  return toTemplat(data)
}
