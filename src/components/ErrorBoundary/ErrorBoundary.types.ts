import { type ReactNode } from 'react'

export type ErrorBoundaryState = {
  hasError: boolean
  error?: unknown
}

export type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}
