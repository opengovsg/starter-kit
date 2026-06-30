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
    path,
    userId,
    // Iron-session id, bound as correlation_id so every line of a session's
    // activity can be grouped back to the session that produced it.
    correlationId: sessionId,
    // We need to manually inject the trace ID from the frontend otherwise logs
    // and traces will not be correlated to the RUM session.
    source: headers.get('x-trpc-source') ?? 'unknown',
    traceId: headers.get('x-datadog-trace-id'),
    clientIp: headers.get('cf-connecting-ip'),
    userAgent: headers.get('user-agent'),
    serverVersion: env.NEXT_PUBLIC_APP_VERSION,
    clientVersion: headers.get(APP_VERSION_HEADER_KEY) ?? undefined,
  })
