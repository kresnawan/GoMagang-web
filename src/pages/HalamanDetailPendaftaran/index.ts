import type { RouteObject } from 'react-router'
import {
  DetailPendaftaranError,
  DetailPendaftaranSkeleton,
  HalamanDetailPendaftaran,
} from './HalamanDetailPendaftaran'
import { action, loader } from './route'

export const detailPendaftaranRoute = {
  Component: HalamanDetailPendaftaran,
  HydrateFallback: DetailPendaftaranSkeleton,
  ErrorBoundary: DetailPendaftaranError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
