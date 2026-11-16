import type { RouteObject } from 'react-router'
import { action, loader } from './route'

export const detailPendaftarRoute = {
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
