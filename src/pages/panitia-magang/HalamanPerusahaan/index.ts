import type { RouteObject } from 'react-router'
import { HalamanPerusahaan, PerusahaanError, PerusahaanSkeleton } from './HalamanPerusahaan'
import { action, loader } from './route'

export const perusahaanRoute = {
  Component: HalamanPerusahaan,
  HydrateFallback: PerusahaanSkeleton,
  ErrorBoundary: PerusahaanError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
