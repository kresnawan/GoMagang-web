import type { RouteObject } from 'react-router'
import { action, loader } from './route'

/** Route data saja (tanpa Component), dipakai oleh dialog Detail lewat fetcher */
export const detailPendaftarRoute = {
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
