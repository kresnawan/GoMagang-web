import type { RouteObject } from 'react-router'
import { DataDiriError, DataDiriSkeleton, HalamanDataDiri } from './HalamanDataDiri'
import { action, loader } from './route'

export const dataDiriRoute = {
  Component: HalamanDataDiri,
  HydrateFallback: DataDiriSkeleton,
  ErrorBoundary: DataDiriError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
