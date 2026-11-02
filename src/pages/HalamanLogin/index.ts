import type { RouteObject } from 'react-router'
import { HalamanLogin } from './HalamanLogin'

export const loginRoute = {
  Component: HalamanLogin,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
