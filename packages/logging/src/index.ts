import { createLogging } from '@opengovsg/starter-kitty-logging'
import type { Logger } from '@opengovsg/starter-kitty-logging'

import { env } from './env'

// Match dd-trace's service name when set, else fall back to the app name.
const service =
  process.env.DD_SERVICE ??
  (process.env.NEXT_PUBLIC_APP_NAME ?? 'starter-kit')
    .toLowerCase()
    .replace(/\s+/g, '-')

// Instantiate once per process. `createBaseLogger(scope)` builds a
// request-scoped logger; `createBaseLogger.system(scope)` for request-less
// contexts (cron, boot, scripts).
export const createBaseLogger = createLogging({
  service,
  env: env.NEXT_PUBLIC_APP_ENV,
  version: env.NEXT_PUBLIC_APP_VERSION,
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  pretty: env.NODE_ENV === 'development',
})

export type { Logger }
export type ScopedLogger = Logger

export interface WithLogger {
  logger: Logger
}
