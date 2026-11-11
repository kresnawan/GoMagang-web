import type { RouteObject } from 'react-router'
import { HalamanKatalog, KatalogError, KatalogSkeleton } from './HalamanKatalog'
import { action, loader } from './route'

export const katalogRoute = {
  Component: HalamanKatalog,
  HydrateFallback: KatalogSkeleton,
  ErrorBoundary: KatalogError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
