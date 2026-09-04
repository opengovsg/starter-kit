import { createBaseLogger } from '@acme/logging'

import { APP_VERSION_HEADER_KEY } from '~/constants'
import { env } from '~/env'

export const createLogger = ({
  path,
  headers,
  userId,
  sessionId,
}: {
  path: string
  headers: Headers
  userId?: string
  sessionId?: string
}) =>
  createBaseLogger({
    clientIp: headers.get('cf-connecting-ip'),
    clientVersion: headers.get(APP_VERSION_HEADER_KEY) ?? undefined,
    // Iron-session id, bound as correlation_id so every line of a session's
    // activity can be grouped back to the session that produced it.
    correlationId: sessionId,
    path,
    serverVersion: env.NEXT_PUBLIC_APP_VERSION,
    source: headers.get('x-trpc-source') ?? 'unknown',
    userAgent: headers.get('user-agent'),
    userId,
  })
