import type { RouteObject } from 'react-router'
import { HalamanKonversiMK, KonversiMKError, KonversiMKSkeleton } from './HalamanKonversiMK'
import { action, loader } from './route'

export const konversiMkTimMbRoute = {
  Component: HalamanKonversiMK,
  HydrateFallback: KonversiMKSkeleton,
  ErrorBoundary: KonversiMKError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
