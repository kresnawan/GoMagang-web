import type { RouteObject } from 'react-router'
import { HalamanTemplatSpDpa, TemplatSpDpaError, TemplatSpDpaSkeleton } from './HalamanTemplatSpDpa'
import { loader } from './route'

export const templatSpDpaRoute = {
  Component: HalamanTemplatSpDpa,
  HydrateFallback: TemplatSpDpaSkeleton,
  ErrorBoundary: TemplatSpDpaError,
  loader,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
