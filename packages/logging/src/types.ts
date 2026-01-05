import type { Logger, ScopedLogger } from './logger'

export interface LogInput {
  message: string
  // The current action.
  action: string
  history?: string[]
  context?: {
    // We want action and error to be specified at the top level
    action?: never
    error?: never
    [key: string]: unknown
  }
  error?: unknown
  merged?: Record<string, unknown>
}

export interface BasicLogger<Input extends Partial<LogInput> = LogInput> {
  debug: (_: Omit<Input, 'error'>) => void
  info: (_: Omit<Input, 'error'>) => void
  warn: (_: Input) => void
  error: (_: Input) => void
}

export interface WithLogger<T extends Logger | ScopedLogger = Logger> {
  logger: T
}
