import { createLogging } from '@opengovsg/logging'
import type { Logger } from '@opengovsg/logging'

import { env } from './env'

// Match dd-trace's service name when set, else fall back to the app name.
const service =
  process.env.DD_SERVICE ??
  (process.env.NEXT_PUBLIC_APP_NAME ?? 'starter-kit')
    .toLowerCase()
    .replaceAll(/\s+/gu, '-')

// Instantiate once per process. `createBaseLogger(scope)` builds a
// request-scoped logger; `createBaseLogger.system(scope)` for request-less
// contexts (cron, boot, scripts).
export const createBaseLogger = createLogging({
  env: env.NEXT_PUBLIC_APP_ENV,
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  pretty: env.NODE_ENV === 'development',
  service,
  version: env.NEXT_PUBLIC_APP_VERSION,
})

export type { Logger } from '@opengovsg/logging'
export type ScopedLogger = Logger

export interface WithLogger {
  logger: Logger
}
